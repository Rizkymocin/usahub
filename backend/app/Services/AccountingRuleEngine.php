<?php

namespace App\Services;

use App\Models\AccountingRule;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Repositories\JournalEntryRepository;
use App\Repositories\JournalLineRepository;
use App\Repositories\AccountingPeriodRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AccountingRuleEngine
{
    public function __construct(
        private JournalEntryRepository $journalEntryRepository,
        private JournalLineRepository $journalLineRepository,
        private AccountingPeriodRepository $periodRepository
    ) {}

    /**
     * Emit an accounting event and create journal entries
     *
     * @param array $event Event data structure:
     *   - event_code: string (e.g., 'EVT_VOUCHER_SOLD')
     *   - ref_type: string (e.g., 'voucher_sale')
     *   - ref_id: int
     *   - occurred_at: Carbon|string
     *   - actor: array ['user_id' => int, 'channel_type' => string]
     *   - payload: array (event-specific data)
     *   - tenant_id: int
     *   - business_id: int
     *
     * @return JournalEntry
     * @throws \Exception
     */
    public function emitEvent(array $event): JournalEntry
    {
        return DB::transaction(function () use ($event) {
            // 1. Validate transaction date (no future dates)
            $occurredAt = Carbon::parse($event['occurred_at']);
            if ($occurredAt->isFuture()) {
                throw new \Exception("Cannot create journal entry for future date: {$occurredAt->format('Y-m-d')}");
            }

            // 2. Find or create accounting period
            $period = $this->periodRepository->findOrCreatePeriod(
                $event['business_id'],
                $event['tenant_id'],
                $occurredAt
            );

            // Validate period is open
            if ($period->isClosed() || $period->isLocked()) {
                throw new \Exception("Cannot post to {$period->status} period: {$period->period_name}");
            }

            // 3. Find matching rules
            $rules = $this->findMatchingRules($event);

            if ($rules->isEmpty()) {
                throw new \Exception("No accounting rules found for event: {$event['event_code']}");
            }

            // 4. Create journal entry header with period
            $entry = $this->createJournalEntry($event, $period->id);

            // 3. Create journal lines from rules
            $lines = collect();
            foreach ($rules as $rule) {
                $line = $this->createJournalLine($entry, $rule, $event);
                if ($line) {
                    $lines->push($line);
                }
            }

            // 4. Validate balanced entry
            $this->validateBalance($lines);

            Log::info("Accounting event processed", [
                'event_code' => $event['event_code'],
                'journal_entry_id' => $entry->id,
                'lines_count' => $lines->count(),
            ]);

            return $entry;
        });
    }

    /**
     * Find matching rules for an event
     */
    private function findMatchingRules(array $event): \Illuminate\Support\Collection
    {
        $businessId = $event['business_id'];
        $eventCode = $event['event_code'];
        $payload = $event['payload'];

        // Get all active rules for this event and business
        $allRules = AccountingRule::active()
            ->forEvent($eventCode)
            ->forBusiness($businessId)
            ->with('account')
            ->get();

        // Filter by condition matching
        $matchingRules = $allRules->filter(function ($rule) use ($payload) {
            return $rule->matches($payload);
        });

        // Sort by priority
        return $matchingRules->sortBy('priority');
    }

    /**
     * Create journal entry header
     */
    private function createJournalEntry(array $event): JournalEntry
    {
        // Use caller-supplied description (e.g. manual journals) if available,
        // otherwise auto-generate from the event code.
        $description = !empty($event['payload']['description'])
            ? $event['payload']['description']
            : $this->buildDescription($event);

        return $this->journalEntryRepository->create([
            'tenant_id' => $event['tenant_id'],
            'business_id' => $event['business_id'],
            'source_type' => $event['ref_type'],
            'source_id' => $event['ref_id'],
            'journal_date' => $event['occurred_at'],
            'event_code' => $event['event_code'],
            'description' => $description,
            'context_json' => $event['payload'],
        ]);
    }

    /**
     * Create a journal line from a rule
     */
    private function createJournalLine(
        JournalEntry $entry,
        AccountingRule $rule,
        array $event
    ): ?JournalLine {
        try {
            $amount = $rule->resolveAmount($event['payload']);

            // Skip zero amounts
            if ($amount <= 0) {
                return null;
            }

            $lineData = [
                'journal_entry_id' => $entry->id,
                'account_id' => $rule->account_id,
                'direction' => $rule->direction,
                'amount' => $amount,
                'channel_type' => $event['actor']['channel_type'] ?? 'system',
                'channel_id' => $event['actor']['user_id'] ?? null,
            ];

            // Add finance user if required
            if ($rule->collector_required) {
                if (isset($event['actor']['user_id'])) {
                    $lineData['finance_user_id'] = $event['actor']['user_id'];
                }
            } else {
                // If not strictly a collector, but we have a payee in the payload (like sales_id or technician_id)
                // we can store it in finance_user_id so it shows up in the journal UI
                if (isset($event['payload']['sales_id'])) {
                    $lineData['finance_user_id'] = $event['payload']['sales_id'];
                } elseif (isset($event['payload']['technician_id'])) {
                    $lineData['finance_user_id'] = $event['payload']['technician_id'];
                }
            }

            // Add customer if present
            if (isset($event['payload']['customer_id'])) {
                $lineData['customer_id'] = $event['payload']['customer_id'];
            }

            return $this->journalLineRepository->create($lineData);
        } catch (\Exception $e) {
            Log::error("Failed to create journal line", [
                'rule_id' => $rule->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Validate that debits equal credits
     */
    private function validateBalance(\Illuminate\Support\Collection $lines): void
    {
        $totalDebit = $lines->where('direction', 'DEBIT')->sum('amount');
        $totalCredit = $lines->where('direction', 'CREDIT')->sum('amount');

        // Allow 1 cent rounding difference
        if (abs($totalDebit - $totalCredit) > 0.01) {
            throw new \Exception(
                "Unbalanced journal entry: DR {$totalDebit} vs CR {$totalCredit}"
            );
        }
    }

    /**
     * Build a human-readable description for the journal entry
     */
    private function buildDescription(array $event): string
    {
        $templates = [
            'EVT_VOUCHER_SOLD' => 'Penjualan voucher',
            'EVT_RECEIVABLE_COLLECTED' => 'Pembayaran piutang',
            'EVT_PURCHASE_PAID' => 'Pembelian',
            'EVT_PURCHASE_ON_CREDIT' => 'Pembelian kredit',
        ];

        $baseDescription = $templates[$event['event_code']] ?? $event['event_code'];

        // Add customer info if available
        if (isset($event['payload']['customer_id'])) {
            $baseDescription .= " - Customer #{$event['payload']['customer_id']}";
        }

        // Add payment type if available
        if (isset($event['payload']['payment_type'])) {
            $paymentType = match ($event['payload']['payment_type']) {
                'cash' => 'tunai',
                'credit' => 'kredit',
                'partial' => 'sebagian',
                default => $event['payload']['payment_type'],
            };
            $baseDescription .= " ({$paymentType})";
        }

        return $baseDescription;
    }

    /**
     * Get rules for a specific event (for testing/preview)
     */
    public function getRulesForEvent(string $eventCode, int $businessId): \Illuminate\Support\Collection
    {
        return AccountingRule::active()
            ->forEvent($eventCode)
            ->forBusiness($businessId)
            ->with('account')
            ->orderBy('priority')
            ->get();
    }

    /**
     * Preview journal entries without saving (dry run)
     */
    public function previewEvent(array $event): array
    {
        $rules = $this->findMatchingRules($event);

        $preview = [
            'event_code' => $event['event_code'],
            'description' => $this->buildDescription($event),
            'lines' => [],
            'total_debit' => 0,
            'total_credit' => 0,
        ];

        foreach ($rules as $rule) {
            try {
                $amount = $rule->resolveAmount($event['payload']);

                if ($amount > 0) {
                    $line = [
                        'account_code' => $rule->account->code,
                        'account_name' => $rule->account->name,
                        'direction' => $rule->direction,
                        'amount' => $amount,
                    ];

                    $preview['lines'][] = $line;

                    if ($rule->direction === 'DEBIT') {
                        $preview['total_debit'] += $amount;
                    } else {
                        $preview['total_credit'] += $amount;
                    }
                }
            } catch (\Exception $e) {
                // Skip invalid rules in preview
                continue;
            }
        }

        $preview['is_balanced'] = abs($preview['total_debit'] - $preview['total_credit']) <= 0.01;

        return $preview;
    }
}

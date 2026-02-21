<?php

namespace App\Services;

use App\Repositories\PaymentRepository;
use Illuminate\Support\Facades\DB;
use Exception;

class PaymentService
{
    public function __construct(
        protected PaymentRepository $repository
    ) {}

    /**
     * Get pending payments (unpaid or partially paid receivables/payables)
     */
    public function getPendingPayments(string $businessPublicId, string $type)
    {
        $business = $this->repository->getBusinessByPublicId($businessPublicId);

        $accountCodes = [];
        if ($type === 'receivable') {
            $accountCodes = ['1030']; // Piutang
        } elseif ($type === 'payable') {
            // Hutang Komisi, Hutang Operasional, Utang Voucher
            $accountCodes = ['2010', '2020', '2040'];
        } else {
            throw new Exception('Invalid type. Use receivable or payable.');
        }

        // Get account IDs for the business
        $accounts = $this->repository->getAccountsByCodes($business->id, $accountCodes)
            ->pluck('id')
            ->toArray();

        if (empty($accounts)) {
            return [];
        }

        // Let's get all lines for these accounts
        $lines = $this->repository->getPendingLinesByAccounts($accounts);

        // Group by source
        $grouped = [];

        foreach ($lines as $line) {
            $amount = (float)$line->amount;
            $isAsset = substr($line->account->code, 0, 1) === '1';

            if ($isAsset) {
                $impact = ($line->direction === 'DEBIT') ? $amount : -$amount;
            } else {
                $impact = ($line->direction === 'CREDIT') ? $amount : -$amount;
            }

            $refKey = null;
            $context = collect($line->journalEntry->context_json ?? []);
            if ($context->has('reference_id')) {
                $refKey = $context->get('reference_id');
            } else {
                // Original transaction
                $refKey = $line->journalEntry->source_type . '-' . $line->journalEntry->source_id;
            }

            if (!isset($grouped[$refKey])) {
                $grouped[$refKey] = [
                    'id' => $line->journalEntry->id,
                    'reference_key' => $refKey,
                    'date' => $line->journalEntry->journal_date->format('Y-m-d H:i:s'),
                    'description' => $line->journalEntry->description,
                    'context' => $line->journalEntry->context_json,
                    'account_code' => $line->account->code,
                    'account_name' => $line->account->name,
                    'customer' => $line->customer ? $line->customer->name : null,
                    'finance_user' => $line->financeUser ? $line->financeUser->name : null,
                    'original_amount' => 0,
                    'paid_amount' => 0,
                    'balance' => 0,
                ];
            }

            if ($impact > 0) {
                $grouped[$refKey]['original_amount'] += $impact;
            } else {
                $grouped[$refKey]['paid_amount'] += abs($impact);
            }
            $grouped[$refKey]['balance'] += $impact;
        }

        // Filter out fully paid ones
        $pending = array_values(array_filter($grouped, function ($item) {
            return $item['balance'] > 0;
        }));

        // Sort by date desc
        usort($pending, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return $pending;
    }

    /**
     * Store a payment for a pending receivable/payable
     */
    public function processPayment(string $businessPublicId, array $validatedData, $user)
    {
        return DB::transaction(function () use ($businessPublicId, $validatedData, $user) {
            $business = $this->repository->getBusinessByPublicId($businessPublicId);

            $arApAccount = $this->repository->getAccountByCode($business->id, $validatedData['account_code']);
            $paymentAccount = $this->repository->getAccountByCode($business->id, $validatedData['payment_account_code']);

            // Create Journal Entry
            $entry = $this->repository->createJournalEntry([
                'tenant_id' => $business->tenant_id,
                'business_id' => $business->id,
                'journal_date' => $validatedData['payment_date'],
                'event_code' => $validatedData['type'] === 'receivable' ? 'EVT_RECEIVABLE_COLLECTED' : 'EVT_PAYABLE_PAID',
                'source_type' => 'App\\Models\\Payment', // Generic or mock source
                'source_id' => 0,
                'description' => $validatedData['description'],
                'context_json' => [
                    'reference_id' => $validatedData['reference_key'],
                    'processed_by' => $user->name
                ],
            ]);

            // Create Lines
            if ($validatedData['type'] === 'receivable') {
                // Receiving cash: Debit Kas/Bank, Credit Piutang
                $this->repository->createJournalLine([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $paymentAccount->id,
                    'direction' => 'DEBIT',
                    'amount' => $validatedData['amount'],
                ]);
                $this->repository->createJournalLine([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $arApAccount->id,
                    'direction' => 'CREDIT',
                    'amount' => $validatedData['amount'],
                ]);
            } else {
                // Paying debt: Debit Hutang, Credit Kas/Bank
                $this->repository->createJournalLine([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $arApAccount->id,
                    'direction' => 'DEBIT',
                    'amount' => $validatedData['amount'],
                ]);
                $this->repository->createJournalLine([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $paymentAccount->id,
                    'direction' => 'CREDIT',
                    'amount' => $validatedData['amount'],
                ]);
            }

            return $entry;
        });
    }
}

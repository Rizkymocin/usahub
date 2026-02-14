<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\Business;
use App\Repositories\AccountingPeriodRepository;
use Illuminate\Support\Facades\DB;

class AccountingPeriodService
{
    protected $repository;

    public function __construct(AccountingPeriodRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all periods for a business
     */
    public function getAllPeriods(string $businessPublicId)
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();
        return $this->repository->getAllPeriods($business->id);
    }

    /**
     * Get period summary with totals
     */
    public function getPeriodSummary(int $periodId): array
    {
        $period = AccountingPeriod::with(['journalEntries.journalLines'])->findOrFail($periodId);

        $totalDebits = 0;
        $totalCredits = 0;
        $entryCountByEvent = [];

        foreach ($period->journalEntries as $entry) {
            // Count entries by event
            $eventCode = $entry->event_code;
            $entryCountByEvent[$eventCode] = ($entryCountByEvent[$eventCode] ?? 0) + 1;

            // Sum debits and credits
            foreach ($entry->journalLines as $line) {
                if ($line->direction === 'DEBIT') {
                    $totalDebits += $line->amount;
                } else {
                    $totalCredits += $line->amount;
                }
            }
        }

        return [
            'period' => [
                'id' => $period->id,
                'period_name' => $period->period_name,
                'start_date' => $period->start_date->format('Y-m-d'),
                'end_date' => $period->end_date->format('Y-m-d'),
                'status' => $period->status,
            ],
            'summary' => [
                'total_entries' => $period->journalEntries->count(),
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
                'entry_count_by_event' => $entryCountByEvent,
            ],
        ];
    }

    /**
     * Close a period with validation
     */
    public function closePeriod(int $periodId, int $userId): AccountingPeriod
    {
        return DB::transaction(function () use ($periodId, $userId) {
            $period = AccountingPeriod::findOrFail($periodId);

            // Validate period can be closed
            if ($period->isClosed() || $period->isLocked()) {
                throw new \Exception("Period is already {$period->status}");
            }

            // Validate period is not in the future (start date must be in the past or today)
            if ($period->start_date->isFuture()) {
                throw new \Exception("Cannot close a future period");
            }

            // Validate all entries are balanced
            $summary = $this->getPeriodSummary($periodId);
            if (!$summary['summary']['is_balanced']) {
                throw new \Exception("Cannot close period with unbalanced entries");
            }

            // Close the period
            $this->repository->closePeriod($period, $userId);

            return $period->fresh();
        });
    }

    /**
     * Reopen a closed period
     */
    public function reopenPeriod(int $periodId, int $userId): AccountingPeriod
    {
        return DB::transaction(function () use ($periodId, $userId) {
            $period = AccountingPeriod::findOrFail($periodId);

            // Validate period can be reopened
            if ($period->isLocked()) {
                throw new \Exception("Cannot reopen a locked period");
            }

            if ($period->isOpen()) {
                throw new \Exception("Period is already open");
            }

            // Reopen the period
            $this->repository->reopenPeriod($period);

            return $period->fresh();
        });
    }
}

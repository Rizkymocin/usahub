<?php

namespace App\Repositories;

use App\Models\AccountingPeriod;
use Carbon\Carbon;

class AccountingPeriodRepository
{
    /**
     * Find or create a period for a given date
     */
    public function findOrCreatePeriod(int $businessId, int $tenantId, $date): AccountingPeriod
    {
        // Calculate period boundaries (monthly)
        $date = Carbon::parse($date);
        $startDate = $date->copy()->startOfMonth();
        $endDate = $date->copy()->endOfMonth();

        // Find or create period
        $period = AccountingPeriod::firstOrCreate(
            [
                'business_id' => $businessId,
                'start_date' => $startDate,
            ],
            [
                'tenant_id' => $tenantId,
                'period_name' => $startDate->format('F Y'),
                'end_date' => $endDate,
                'status' => AccountingPeriod::STATUS_OPEN,
            ]
        );

        return $period;
    }

    /**
     * Get period for a specific date
     */
    public function getPeriodForDate(int $businessId, $date): ?AccountingPeriod
    {
        $date = Carbon::parse($date);

        return AccountingPeriod::where('business_id', $businessId)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first();
    }

    /**
     * Get all open periods for a business
     */
    public function getOpenPeriods(int $businessId)
    {
        return AccountingPeriod::where('business_id', $businessId)
            ->where('status', AccountingPeriod::STATUS_OPEN)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Get all periods for a business
     */
    public function getAllPeriods(int $businessId)
    {
        return AccountingPeriod::where('business_id', $businessId)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Close a period
     */
    public function closePeriod(AccountingPeriod $period, int $userId): bool
    {
        $period->status = AccountingPeriod::STATUS_CLOSED;
        $period->closed_at = now();
        $period->closed_by_user_id = $userId;
        return $period->save();
    }

    /**
     * Reopen a period
     */
    public function reopenPeriod(AccountingPeriod $period): bool
    {
        $period->status = AccountingPeriod::STATUS_OPEN;
        $period->closed_at = null;
        $period->closed_by_user_id = null;
        return $period->save();
    }
}

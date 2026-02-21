<?php

namespace App\Repositories;

use App\Models\Business;
use App\Models\IspReseller;
use App\Models\IspProspect;
use App\Models\JournalLine;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardRepository
{
    /**
     * Get the total count of active businesses for a tenant.
     */
    public function getBusinessCount(int $tenantId): int
    {
        return Business::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->count();
    }

    /**
     * Get aggregate active customers across specified businesses.
     */
    public function getAggregateActiveCustomers(array $businessIds): int
    {
        return IspReseller::whereIn('business_id', $businessIds)
            ->where('is_active', true)
            ->count();
    }

    /**
     * Get aggregate revenue across specified businesses (all-time or specific period).
     */
    public function getAggregateRevenue(array $businessIds): float
    {
        return JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->where('accounts.type', 'REVENUE') // Example type, adjust if different in your DB
            ->where('journal_lines.direction', 'CREDIT') // Typically revenue increased via credit
            ->sum('journal_lines.amount');
    }

    /**
     * Get today's revenue for a specific business.
     */
    public function getTodayBusinessRevenue(int $businessId): float
    {
        return JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.business_id', $businessId)
            ->whereDate('journal_entries.journal_date', Carbon::today())
            ->where('accounts.type', 'REVENUE')
            ->where('journal_lines.direction', 'CREDIT')
            ->sum('journal_lines.amount');
    }

    /**
     * Get recent transactions for a business.
     */
    public function getRecentTransactions(int $businessId, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        return JournalEntry::where('business_id', $businessId)
            ->latest('journal_date')
            ->take($limit)
            ->get();
    }

    /**
     * Get business performance for owner dashboard (Top 5).
     */
    public function getBusinessPerformanceRows(array $businessIds, int $limit = 5): array
    {
        $businesses = Business::whereIn('id', $businessIds)
            ->where('is_active', true)
            ->get();

        $performance = [];

        foreach ($businesses as $business) {
            $customers = IspReseller::where('business_id', $business->id)->where('is_active', true)->count();
            $revenue = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
                ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
                ->where('journal_entries.business_id', $business->id)
                ->where('accounts.type', 'REVENUE')
                ->where('journal_lines.direction', 'CREDIT')
                ->sum('journal_lines.amount');

            $performance[] = [
                'id' => $business->public_id,
                'name' => $business->name,
                'customers' => $customers,
                'revenue' => $revenue,
                'growth' => '+0%', // Placeholder for future implementation
                'status' => 'active',
                'type' => $business->category ?? 'Unknown',
            ];
        }

        // Sort by revenue descending
        usort($performance, function ($a, $b) {
            return $b['revenue'] <=> $a['revenue'];
        });

        return array_slice($performance, 0, $limit);
    }
}

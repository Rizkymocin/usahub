<?php

namespace App\Services;

use App\Repositories\DashboardRepository;
use App\Models\Business;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    protected $dashboardRepo;

    public function __construct(DashboardRepository $dashboardRepo)
    {
        $this->dashboardRepo = $dashboardRepo;
    }

    /**
     * Get data for Owner (Tenant) Dashboard
     */
    public function getOwnerDashboardData(int $tenantId, array $businessIds): array
    {
        try {
            $businessCount = $this->dashboardRepo->getBusinessCount($tenantId);
            $totalCustomers = $this->dashboardRepo->getAggregateActiveCustomers($businessIds);
            $totalRevenue = $this->dashboardRepo->getAggregateRevenue($businessIds);

            // Generate dummy formatted data for now for UI consistency
            $formattedRevenue = 'Rp ' . number_format($totalRevenue, 0, ',', '.');

            $businessPerformance = $this->dashboardRepo->getBusinessPerformanceRows($businessIds, 5);

            // Format revenue for frontend explicitly
            $formattedPerformance = array_map(function ($biz) {
                $biz['revenue_formatted'] = 'Rp ' . number_format($biz['revenue'], 0, ',', '.');
                return $biz;
            }, $businessPerformance);

            return [
                'stats' => [
                    'total_businesses' => $businessCount,
                    'total_revenue' => $formattedRevenue,
                    'total_revenue_raw' => $totalRevenue,
                    'total_customers' => $totalCustomers,
                ],
                'business_performance' => $formattedPerformance,
                'recent_activities' => [], // To be implemented
                'top_performers' => array_slice($formattedPerformance, 0, 3),
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching owner dashboard data: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get data for Business Admin Dashboard
     */
    public function getBusinessDashboardData(int $businessId): array
    {
        try {
            $todayRevenue = $this->dashboardRepo->getTodayBusinessRevenue($businessId);
            $activeCustomers = $this->dashboardRepo->getAggregateActiveCustomers([$businessId]);
            $recentTransactions = $this->dashboardRepo->getRecentTransactions($businessId, 5);

            $formattedRevenue = 'Rp ' . number_format($todayRevenue, 0, ',', '.');

            // Format transactions for frontend
            $formattedTransactions = $recentTransactions->map(function ($txn) {
                return [
                    'id' => '#TRX-' . $txn->id, // simplistic fallback
                    'customer' => $txn->description ?? 'Unknown',
                    'amount' => 'View details', // Journal Entry doesn't store single amount mostly
                    'time' => $txn->journal_date->diffForHumans(),
                    'status' => 'completed',
                    'method' => 'System',
                ];
            });

            return [
                'stats' => [
                    'today_revenue' => $formattedRevenue,
                    'active_customers' => $activeCustomers,
                    'transactions_count' => count($recentTransactions), // Note: Need a proper today tx count
                ],
                'recent_transactions' => $formattedTransactions,
                'staff_performance' => [], // To be implemented
                'customer_analytics' => [], // To be implemented
                'weekly_revenue' => [], // To be implemented
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching business dashboard data: ' . $e->getMessage());
            throw $e;
        }
    }
}

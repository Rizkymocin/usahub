<?php

namespace App\Services;

use App\Repositories\ReportRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    protected $reportRepo;

    public function __construct(ReportRepository $reportRepo)
    {
        $this->reportRepo = $reportRepo;
    }

    /**
     * Parse date range input or return defaults (this month)
     */
    private function parseDateRange(?string $startDateStr, ?string $endDateStr): array
    {
        try {
            $startDate = $startDateStr ? Carbon::parse($startDateStr) : Carbon::now()->startOfMonth();
            $endDate = $endDateStr ? Carbon::parse($endDateStr) : Carbon::now()->endOfMonth();
        } catch (\Exception $e) {
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
        }

        return [$startDate, $endDate];
    }

    public function getProfitAndLoss(Collection $businesses, ?string $startDateStr, ?string $endDateStr): array
    {
        $businessIds = $businesses->pluck('id')->toArray();
        if (empty($businessIds)) {
            return $this->emptyPnLResponse();
        }

        [$startDate, $endDate] = $this->parseDateRange($startDateStr, $endDateStr);

        // Current Period
        $current = $this->reportRepo->getProfitAndLoss($businessIds, $startDate, $endDate);

        // Month Trends (Last 6 months)
        $trendStart = $endDate->copy()->subMonths(5)->startOfMonth();
        $trends = $this->reportRepo->getTrendData($businessIds, $trendStart, $endDate);

        return [
            'summary' => [
                'revenue' => [
                    'value' => $current['revenue'],
                    'formatted' => 'Rp ' . number_format($current['revenue'], 0, ',', '.')
                ],
                'expense' => [
                    'value' => $current['expense'],
                    'formatted' => 'Rp ' . number_format($current['expense'], 0, ',', '.')
                ],
                'net_income' => [
                    'value' => $current['net_income'],
                    'formatted' => 'Rp ' . number_format($current['net_income'], 0, ',', '.')
                ],
                'net_margin_percentage' => $current['revenue'] > 0
                    ? round(($current['net_income'] / $current['revenue']) * 100, 2)
                    : 0
            ],
            'chart_data' => $trends
        ];
    }

    public function getBusinessPerformance(Collection $businesses, ?string $startDateStr, ?string $endDateStr): array
    {
        $businessIds = $businesses->pluck('id')->toArray();
        if (empty($businessIds)) {
            return [];
        }

        [$startDate, $endDate] = $this->parseDateRange($startDateStr, $endDateStr);

        $performance = $this->reportRepo->getBusinessPerformance($businessIds, $startDate, $endDate);

        // Format for frontend
        foreach ($performance as &$perf) {
            $perf['revenue_formatted'] = 'Rp ' . number_format($perf['revenue'], 0, ',', '.');
            $perf['expense_formatted'] = 'Rp ' . number_format($perf['expense'], 0, ',', '.');
            $perf['net_income_formatted'] = 'Rp ' . number_format($perf['net_income'], 0, ',', '.');
            $perf['margin_percentage'] = $perf['revenue'] > 0 ? round(($perf['net_income'] / $perf['revenue']) * 100, 2) : 0;
            // Provide a static alias for the chart to digest easily
            $perf['value'] = $perf['revenue'];
        }

        return $performance;
    }

    public function getCashFlow(Collection $businesses, ?string $startDateStr, ?string $endDateStr): array
    {
        $businessIds = $businesses->pluck('id')->toArray();
        if (empty($businessIds)) {
            return [
                'inflow' => 0,
                'outflow' => 0,
                'net_cash_flow' => 0,
                'chart_data' => []
            ];
        }

        [$startDate, $endDate] = $this->parseDateRange($startDateStr, $endDateStr);

        $current = $this->reportRepo->getCashFlow($businessIds, $startDate, $endDate);

        $trendStart = $endDate->copy()->subMonths(5)->startOfMonth();
        $trends = $this->reportRepo->getCashFlowTrends($businessIds, $trendStart, $endDate);

        return [
            'inflow' => $current['inflow'],
            'outflow' => $current['outflow'],
            'net_cash_flow' => $current['net_cash_flow'],
            'chart_data' => $trends
        ];
    }

    public function getArAp(Collection $businesses, ?string $startDateStr = null, ?string $endDateStr = null): array
    {
        $businessIds = $businesses->pluck('id')->toArray();
        if (empty($businessIds)) {
            return [
                'total_receivables' => 0,
                'total_payables' => 0,
                'top_debtors' => [],
                'top_creditors' => []
            ];
        }

        // We use endDate as the cutoff for balances
        [, $endDate] = $this->parseDateRange($startDateStr, $endDateStr);

        $balances = $this->reportRepo->getArApBalances($businessIds, $endDate);

        return [
            'total_receivables' => $balances['total_receivables'],
            'total_payables' => $balances['total_payables'],
            'top_debtors' => [], // Placeholder for future feature
            'top_creditors' => [] // Placeholder for future feature
        ];
    }

    public function getGeneralLedger(Collection $businesses, ?string $startDateStr = null, ?string $endDateStr = null, ?string $accountCode = null): array
    {
        $businessIds = $businesses->pluck('id')->toArray();
        if (empty($businessIds)) {
            return [
                'accounts' => [],
                'selected_account' => null,
                'opening_balance' => 0,
                'lines' => [],
                'closing_balance' => 0,
            ];
        }

        // 1. Get List of Accounts
        $accounts = $this->reportRepo->getAccountList($businessIds);

        if (empty($accounts)) {
            return [
                'accounts' => [],
                'selected_account' => null,
                'opening_balance' => 0,
                'lines' => [],
                'closing_balance' => 0,
            ];
        }

        // 2. Determine Selected Account
        $selectedAccount = null;
        if ($accountCode) {
            $selectedAccount = collect($accounts)->firstWhere('code', $accountCode);
        }

        // Default to first account if none selected or not found
        if (!$selectedAccount) {
            $selectedAccount = $accounts[0];
            $accountCode = $selectedAccount->code;
        }

        [$startDate, $endDate] = $this->parseDateRange($startDateStr, $endDateStr);

        // 3. Get Opening Balance
        $openingBalance = $this->reportRepo->getLedgerOpeningBalance($businessIds, $accountCode, $startDate);

        // 4. Get Journal Lines within period
        $lines = $this->reportRepo->getLedgerLines($businessIds, $accountCode, $startDate, $endDate);

        // 5. Calculate Running Balance
        $formattedLines = [];
        $runningBalance = $openingBalance;

        foreach ($lines as $line) {
            $amount = (float) $line->amount;

            // Adjust running balance based on normal balance rules
            if (in_array($line->account_type, ['asset', 'expense'])) {
                if ($line->direction === 'DEBIT') {
                    $runningBalance += $amount;
                    $debit = $amount;
                    $credit = 0;
                } else {
                    $runningBalance -= $amount;
                    $debit = 0;
                    $credit = $amount;
                }
            } else { // liability, equity, revenue
                if ($line->direction === 'CREDIT') {
                    $runningBalance += $amount;
                    $debit = 0;
                    $credit = $amount;
                } else {
                    $runningBalance -= $amount;
                    $debit = $amount;
                    $credit = 0;
                }
            }

            $formattedLines[] = [
                'date' => $line->date,
                'description' => $line->description,
                'event_code' => $line->event_code,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $runningBalance
            ];
        }

        return [
            'accounts' => $accounts,
            'selected_account' => $selectedAccount,
            'opening_balance' => $openingBalance,
            'lines' => $formattedLines,
            'closing_balance' => $runningBalance,
        ];
    }

    private function emptyPnLResponse(): array
    {
        return [
            'summary' => [
                'revenue' => ['value' => 0, 'formatted' => 'Rp 0'],
                'expense' => ['value' => 0, 'formatted' => 'Rp 0'],
                'net_income' => ['value' => 0, 'formatted' => 'Rp 0'],
                'net_margin_percentage' => 0
            ],
            'chart_data' => []
        ];
    }
}

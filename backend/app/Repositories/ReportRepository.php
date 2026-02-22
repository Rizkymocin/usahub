<?php

namespace App\Repositories;

use App\Models\Business;
use App\Models\JournalLine;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportRepository
{
    /**
     * Get aggregate Profit and Loss calculation (Revenue, COGS, Expense).
     *
     * @param array $businessIds The businesses belonging to the tenant/owner
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function getProfitAndLoss(array $businessIds, Carbon $startDate, Carbon $endDate): array
    {
        $data = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->whereBetween('journal_entries.journal_date', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('accounts.type', ['revenue', 'expense'])
            ->select(
                'accounts.type',
                DB::raw("
                    SUM(
                        CASE 
                            WHEN accounts.type = 'revenue' AND journal_lines.direction = 'CREDIT' THEN journal_lines.amount
                            WHEN accounts.type = 'revenue' AND journal_lines.direction = 'DEBIT' THEN -journal_lines.amount
                            WHEN accounts.type = 'expense' AND journal_lines.direction = 'DEBIT' THEN journal_lines.amount
                            WHEN accounts.type = 'expense' AND journal_lines.direction = 'CREDIT' THEN -journal_lines.amount
                            ELSE 0
                        END
                    ) as total_amount
                ")
            )
            ->groupBy('accounts.type')
            ->get();

        $revenue = 0;
        $expense = 0;

        foreach ($data as $row) {
            if ($row->type === 'revenue') $revenue = (float) $row->total_amount;
            if ($row->type === 'expense') $expense = (float) $row->total_amount;
        }

        return [
            'revenue' => $revenue,
            'expense' => $expense,
            'net_income' => $revenue - $expense
        ];
    }

    /**
     * Group Revenue and Expenses per business for performance comparison
     */
    public function getBusinessPerformance(array $businessIds, Carbon $startDate, Carbon $endDate): array
    {
        $businesses = Business::whereIn('id', $businessIds)->get()->keyBy('id');

        $data = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->whereBetween('journal_entries.journal_date', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('accounts.type', ['revenue', 'expense'])
            ->select(
                'journal_entries.business_id',
                'accounts.type',
                DB::raw("
                    SUM(
                        CASE 
                            WHEN accounts.type = 'revenue' AND journal_lines.direction = 'CREDIT' THEN journal_lines.amount
                            WHEN accounts.type = 'revenue' AND journal_lines.direction = 'DEBIT' THEN -journal_lines.amount
                            WHEN accounts.type = 'expense' AND journal_lines.direction = 'DEBIT' THEN journal_lines.amount
                            WHEN accounts.type = 'expense' AND journal_lines.direction = 'CREDIT' THEN -journal_lines.amount
                            ELSE 0
                        END
                    ) as total_amount
                ")
            )
            ->groupBy('journal_entries.business_id', 'accounts.type')
            ->get();

        $performance = [];

        // Initialize for all requested businesses
        foreach ($businesses as $id => $business) {
            $performance[$id] = [
                'business_id' => $business->id,
                'public_id' => $business->public_id,
                'name' => $business->name,
                'revenue' => 0,
                'expense' => 0,
                'net_income' => 0,
            ];
        }

        foreach ($data as $row) {
            $bId = $row->business_id;
            if ($row->type === 'revenue') {
                $performance[$bId]['revenue'] = (float) $row->total_amount;
            }
            if ($row->type === 'expense') {
                $performance[$bId]['expense'] = (float) $row->total_amount;
            }
        }

        foreach ($performance as &$perf) {
            $perf['net_income'] = $perf['revenue'] - $perf['expense'];
        }

        // Return array sorted by revenue (descending)
        usort($performance, function ($a, $b) {
            return $b['revenue'] <=> $a['revenue'];
        });

        return array_values($performance);
    }

    /**
     * Get Monthly Revenue & Expense trends
     */
    public function getTrendData(array $businessIds, Carbon $startDate, Carbon $endDate): array
    {
        $data = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->whereBetween('journal_entries.journal_date', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('accounts.type', ['revenue', 'expense'])
            ->select(
                DB::raw("TO_CHAR(journal_entries.journal_date, 'YYYY-MM') as month_year"),
                'accounts.type',
                DB::raw("
                    SUM(
                        CASE 
                            WHEN accounts.type = 'revenue' AND journal_lines.direction = 'CREDIT' THEN journal_lines.amount
                            WHEN accounts.type = 'revenue' AND journal_lines.direction = 'DEBIT' THEN -journal_lines.amount
                            WHEN accounts.type = 'expense' AND journal_lines.direction = 'DEBIT' THEN journal_lines.amount
                            WHEN accounts.type = 'expense' AND journal_lines.direction = 'CREDIT' THEN -journal_lines.amount
                            ELSE 0
                        END
                    ) as total_amount
                ")
            )
            ->groupBy('month_year', 'accounts.type')
            ->orderBy('month_year')
            ->get();

        $trends = [];
        foreach ($data as $row) {
            $month = $row->month_year;
            if (!isset($trends[$month])) {
                $trends[$month] = ['month' => $month, 'revenue' => 0, 'expense' => 0];
            }
            if ($row->type === 'revenue') {
                $trends[$month]['revenue'] = (float) $row->total_amount;
            } elseif ($row->type === 'expense') {
                $trends[$month]['expense'] = (float) $row->total_amount;
            }
        }

        return array_values($trends);
    }

    /**
     * Get aggregate Cash Inflows and Outflows within the period.
     */
    public function getCashFlow(array $businessIds, Carbon $startDate, Carbon $endDate): array
    {
        $data = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->whereBetween('journal_entries.journal_date', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('accounts.code', ['1010', '1020']) // Kas, Bank
            ->select(
                DB::raw("
                    SUM(CASE WHEN journal_lines.direction = 'DEBIT' THEN journal_lines.amount ELSE 0 END) as inflow
                "),
                DB::raw("
                    SUM(CASE WHEN journal_lines.direction = 'CREDIT' THEN journal_lines.amount ELSE 0 END) as outflow
                ")
            )
            ->first();

        return [
            'inflow' => (float) ($data->inflow ?? 0),
            'outflow' => (float) ($data->outflow ?? 0),
            'net_cash_flow' => (float) ($data->inflow ?? 0) - (float) ($data->outflow ?? 0),
        ];
    }

    /**
     * Get Monthly Cashflow Trends
     */
    public function getCashFlowTrends(array $businessIds, Carbon $startDate, Carbon $endDate): array
    {
        $data = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->whereBetween('journal_entries.journal_date', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('accounts.code', ['1010', '1020'])
            ->select(
                DB::raw("TO_CHAR(journal_entries.journal_date, 'YYYY-MM') as month_year"),
                DB::raw("
                    SUM(CASE WHEN journal_lines.direction = 'DEBIT' THEN journal_lines.amount ELSE 0 END) as inflow
                "),
                DB::raw("
                    SUM(CASE WHEN journal_lines.direction = 'CREDIT' THEN journal_lines.amount ELSE 0 END) as outflow
                ")
            )
            ->groupBy('month_year')
            ->orderBy('month_year')
            ->get();

        $trends = [];
        foreach ($data as $row) {
            $month = $row->month_year;
            $inflow = (float) $row->inflow;
            $outflow = (float) $row->outflow;
            $trends[] = [
                'month' => $month,
                'inflow' => $inflow,
                'outflow' => $outflow,
                'net_cash_flow' => $inflow - $outflow,
            ];
        }

        return $trends;
    }

    /**
     * Get AR and AP current balances. Balances act as of the endDate limit.
     */
    public function getArApBalances(array $businessIds, Carbon $asOfDate): array
    {
        // AR: 1030 (Piutang) -> Asset
        $ar = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->where('journal_entries.journal_date', '<=', $asOfDate->endOfDay())
            ->whereIn('accounts.code', ['1030'])
            ->select(
                DB::raw("
                    SUM(CASE WHEN journal_lines.direction = 'DEBIT' THEN journal_lines.amount ELSE 0 END) -
                    SUM(CASE WHEN journal_lines.direction = 'CREDIT' THEN journal_lines.amount ELSE 0 END) as balance
                ")
            )
            ->first();

        // AP: 2010 (Utang Voucher), 2020 (Hutang Komisi), 2040 (Hutang Operasional) -> Liability
        $ap = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->where('journal_entries.journal_date', '<=', $asOfDate->endOfDay())
            ->whereIn('accounts.code', ['2010', '2020', '2040'])
            ->select(
                DB::raw("
                    SUM(CASE WHEN journal_lines.direction = 'CREDIT' THEN journal_lines.amount ELSE 0 END) -
                    SUM(CASE WHEN journal_lines.direction = 'DEBIT' THEN journal_lines.amount ELSE 0 END) as balance
                ")
            )
            ->first();

        return [
            'total_receivables' => (float) ($ar->balance ?? 0),
            'total_payables' => (float) ($ap->balance ?? 0),
        ];
    }

    /**
     * Get distinct accounts for the businesses.
     */
    public function getAccountList(array $businessIds): array
    {
        return DB::table('accounts')
            ->whereIn('business_id', $businessIds)
            ->select('code', 'name')
            ->groupBy('code', 'name')
            ->orderBy('code')
            ->get()
            ->toArray();
    }

    /**
     * Calculate opening balance for a specific account code before a date.
     */
    public function getLedgerOpeningBalance(array $businessIds, string $accountCode, Carbon $startDate): float
    {
        $data = JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->where('journal_entries.journal_date', '<', $startDate->startOfDay())
            ->where(function ($q) use ($accountCode) {
                $q->where('accounts.code', $accountCode)
                    ->orWhereExists(function ($sub) use ($accountCode) {
                        $sub->select(DB::raw(1))
                            ->from('accounts as parent')
                            ->whereColumn('parent.id', 'accounts.parent_id')
                            ->where('parent.code', $accountCode);
                    });
            })
            ->select(
                'accounts.type',
                DB::raw("SUM(CASE WHEN journal_lines.direction = 'DEBIT' THEN journal_lines.amount ELSE 0 END) as total_debit"),
                DB::raw("SUM(CASE WHEN journal_lines.direction = 'CREDIT' THEN journal_lines.amount ELSE 0 END) as total_credit")
            )
            ->groupBy('accounts.type')
            ->get();

        if ($data->isEmpty()) return 0.0;

        $totalBalance = 0.0;
        foreach ($data as $row) {
            $debit = (float) $row->total_debit;
            $credit = (float) $row->total_credit;

            // Normal balance rule
            if (in_array($row->type, ['asset', 'expense'])) {
                $totalBalance += ($debit - $credit);
            } else {
                $totalBalance += ($credit - $debit);
            }
        }

        return $totalBalance;
    }

    /**
     * Get journal lines for a specific account code within the date range.
     */
    public function getLedgerLines(array $businessIds, string $accountCode, Carbon $startDate, Carbon $endDate)
    {
        return JournalLine::join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->whereIn('journal_entries.business_id', $businessIds)
            ->whereBetween('journal_entries.journal_date', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->where(function ($q) use ($accountCode) {
                $q->where('accounts.code', $accountCode)
                    ->orWhereExists(function ($sub) use ($accountCode) {
                        $sub->select(DB::raw(1))
                            ->from('accounts as parent')
                            ->whereColumn('parent.id', 'accounts.parent_id')
                            ->where('parent.code', $accountCode);
                    });
            })
            ->select(
                'journal_entries.journal_date as date',
                'journal_entries.description',
                'journal_entries.event_code',
                'journal_lines.direction',
                'journal_lines.amount',
                'accounts.type as account_type' // for balance calculation
            )
            ->orderBy('journal_entries.journal_date', 'asc')
            ->orderBy('journal_entries.id', 'asc')
            ->get();
    }
}

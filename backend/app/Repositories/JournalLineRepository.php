<?php

namespace App\Repositories;

use App\Models\JournalLine;

class JournalLineRepository
{
    /**
     * Create a new journal line
     */
    public function create(array $data): JournalLine
    {
        return JournalLine::create($data);
    }

    /**
     * Get lines for a journal entry
     */
    public function getForEntry(int $journalEntryId)
    {
        return JournalLine::where('journal_entry_id', $journalEntryId)
            ->with('account')
            ->get();
    }

    /**
     * Get lines for a specific account
     */
    public function getForAccount(int $accountId, array $filters = [])
    {
        $query = JournalLine::where('account_id', $accountId)
            ->with(['journalEntry']);

        if (isset($filters['direction'])) {
            $query->where('direction', $filters['direction']);
        }

        if (isset($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (isset($filters['finance_user_id'])) {
            $query->where('finance_user_id', $filters['finance_user_id']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get customer receivables
     */
    public function getCustomerReceivables(int $customerId, int $accountId)
    {
        return JournalLine::where('customer_id', $customerId)
            ->where('account_id', $accountId)
            ->with(['journalEntry'])
            ->get();
    }
}

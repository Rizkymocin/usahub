<?php

namespace App\Repositories;

use App\Models\Business;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\JournalLine;

class PaymentRepository
{
    /**
     * Get pending payment lines by account IDs.
     */
    public function getPendingLinesByAccounts(array $accountIds)
    {
        return JournalLine::with(['journalEntry', 'account', 'customer', 'financeUser'])
            ->whereIn('account_id', $accountIds)
            ->get();
    }

    public function getBusinessByPublicId(string $publicId)
    {
        return Business::where('public_id', $publicId)->firstOrFail();
    }

    public function getAccountsByCodes(int $businessId, array $accountCodes)
    {
        return Account::where('business_id', $businessId)
            ->whereIn('code', $accountCodes)
            ->get();
    }

    public function getAccountByCode(int $businessId, string $code)
    {
        return Account::where('business_id', $businessId)
            ->where('code', $code)
            ->firstOrFail();
    }

    public function createJournalEntry(array $data)
    {
        return JournalEntry::create($data);
    }

    public function createJournalLine(array $data)
    {
        return JournalLine::create($data);
    }
}

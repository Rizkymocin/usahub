<?php

namespace App\Services;

use App\Repositories\ManualJournalRepository;
use App\Services\AccountingRuleEngine;
use Exception;

class ManualJournalService
{
    /**
     * Supported manual journal event codes and their human-readable labels.
     */
    const ALLOWED_EVENT_CODES = [
        'EVT_PRIVE',
        'EVT_EQUITY_INVESTED',
        'EVT_INVESTOR_EQUITY',
        'EVT_TAX_PAID_PPH',
        'EVT_TAX_PAID_ISP',
        'EVT_SIMPANAN_POKOK',
        'EVT_SIMPANAN_WAJIB',
        'EVT_IURAN_KOPERASI',
    ];

    public function __construct(
        protected ManualJournalRepository $repository,
        protected AccountingRuleEngine $accountingRuleEngine
    ) {}

    /**
     * Create a manual journal entry using the accounting rule engine.
     */
    public function create(string $businessPublicId, array $data, int $userId): \App\Models\JournalEntry
    {
        $eventCode = $data['event_code'];

        if (!in_array($eventCode, self::ALLOWED_EVENT_CODES)) {
            throw new Exception("Event code '{$eventCode}' is not allowed for manual journals.");
        }

        $business = $this->repository->getBusinessByPublicId($businessPublicId);

        return $this->accountingRuleEngine->emitEvent([
            'event_code' => $eventCode,
            'ref_type' => 'manual_journal',
            'ref_id' => 0,
            'occurred_at' => $data['date'],
            'actor' => [
                'user_id' => $userId,
                'channel_type' => 'web',
            ],
            'payload' => [
                'amount' => $data['amount'],
                'description' => $data['description'],
            ],
            'tenant_id' => $business->tenant_id,
            'business_id' => $business->id,
        ]);
    }
}

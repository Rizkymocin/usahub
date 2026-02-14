<?php

namespace App\Repositories;

use App\Models\JournalEntry;

class JournalEntryRepository
{
    /**
     * Create a new journal entry
     */
    public function create(array $data): JournalEntry
    {
        return JournalEntry::create($data);
    }

    /**
     * Find journal entry by ID
     */
    public function find(int $id): ?JournalEntry
    {
        return JournalEntry::find($id);
    }

    /**
     * Get journal entries for a business
     */
    public function getForBusiness(int $businessId, array $filters = [])
    {
        $query = JournalEntry::where('business_id', $businessId)
            ->with(['journalLines.account']);

        if (isset($filters['event_code'])) {
            $query->where('event_code', $filters['event_code']);
        }

        if (isset($filters['source_type'])) {
            $query->where('source_type', $filters['source_type']);
        }

        if (isset($filters['date_from'])) {
            $query->where('journal_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('journal_date', '<=', $filters['date_to']);
        }

        return $query->orderBy('journal_date', 'desc')->get();
    }

    /**
     * Get journal entry by source
     */
    public function findBySource(string $sourceType, int $sourceId): ?JournalEntry
    {
        return JournalEntry::where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->first();
    }
}

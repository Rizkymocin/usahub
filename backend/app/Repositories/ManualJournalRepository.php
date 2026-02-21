<?php

namespace App\Repositories;

use App\Models\Business;

class ManualJournalRepository
{
    public function getBusinessByPublicId(string $publicId): Business
    {
        return Business::where('public_id', $publicId)->firstOrFail();
    }
}

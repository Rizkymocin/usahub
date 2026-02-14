<?php

namespace App\Repositories;

use App\Models\IspPurchase;
use Illuminate\Database\Eloquent\Collection;

class IspPurchaseRepository
{
    public function findByBusiness(int $businessId): Collection
    {
        return IspPurchase::where('business_id', $businessId)
            ->with(['items.maintenanceItem', 'createdBy'])
            ->orderBy('purchase_date', 'desc')
            ->get();
    }

    public function findByPublicId(string $publicId, int $businessId): ?IspPurchase
    {
        return IspPurchase::where('public_id', $publicId)
            ->where('business_id', $businessId)
            ->with(['items.maintenanceItem', 'createdBy'])
            ->first();
    }

    public function create(array $data): IspPurchase
    {
        return IspPurchase::create($data);
    }
}

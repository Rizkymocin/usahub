<?php

namespace App\Repositories;

use App\Models\IspVoucherStockAdjustment;
use Illuminate\Database\Eloquent\Collection;

class IspVoucherStockAdjustmentRepository
{
    public function create(array $data): IspVoucherStockAdjustment
    {
        return IspVoucherStockAdjustment::create($data);
    }

    public function getByBusinessId(int $businessId): Collection
    {
        return IspVoucherStockAdjustment::where('business_id', $businessId)
            ->with(['voucherProduct', 'createdBy'])
            ->latest()
            ->get();
    }
}

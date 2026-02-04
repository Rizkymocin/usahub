<?php

namespace App\Repositories;

use App\Models\IspVoucherProduct;
use Illuminate\Database\Eloquent\Collection;

class IspVoucherProductRepository
{
    public function findByBusiness(int $businessId): Collection
    {
        return IspVoucherProduct::where('business_id', $businessId)->get();
    }

    public function findById(int $id, int $tenantId): ?IspVoucherProduct
    {
        return IspVoucherProduct::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->first();
    }

    public function create(array $data): IspVoucherProduct
    {
        return IspVoucherProduct::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return IspVoucherProduct::where('id', $id)->update($data);
    }

    public function delete(string $publicId, int $businessId): bool
    {
        return IspVoucherProduct::where('public_id', $publicId)->where('business_id', $businessId)->delete();
    }
}

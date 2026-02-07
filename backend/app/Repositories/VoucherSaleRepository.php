<?php

namespace App\Repositories;

use App\Models\VoucherSale;
use Illuminate\Database\Eloquent\Collection;

class VoucherSaleRepository
{
    public function findByBusiness(int $businessId, ?int $userId = null): Collection
    {
        $query = VoucherSale::where('business_id', $businessId)
            ->with(['items.voucherProduct', 'outlet', 'reseller', 'soldBy']);

        if ($userId) {
            $query->where('sold_by_user_id', $userId);
        }

        return $query->orderBy('sold_at', 'desc')->get();
    }

    public function findById(int $id, int $businessId): ?VoucherSale
    {
        return VoucherSale::where('id', $id)
            ->where('business_id', $businessId)
            ->with(['items.voucherProduct', 'outlet', 'reseller', 'soldBy'])
            ->first();
    }

    public function findByPublicId(string $publicId, int $businessId): ?VoucherSale
    {
        return VoucherSale::where('public_id', $publicId)
            ->where('business_id', $businessId)
            ->with(['items.voucherProduct', 'outlet', 'reseller', 'soldBy'])
            ->first();
    }

    public function create(array $data): VoucherSale
    {
        return VoucherSale::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $sale = VoucherSale::find($id);
        if (!$sale) {
            return false;
        }
        return $sale->update($data);
    }

    public function delete(int $id): bool
    {
        $sale = VoucherSale::find($id);
        if (!$sale) {
            return false;
        }
        return $sale->delete();
    }

    public function addPayment(int $id, float $amount, $userId, $method = 'cash', $note = null): bool
    {
        $sale = VoucherSale::find($id);
        if (!$sale) {
            return false;
        }
        $sale->addPayment($amount, $userId, $method, $note);
        return true;
    }
}

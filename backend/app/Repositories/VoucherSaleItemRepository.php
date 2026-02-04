<?php

namespace App\Repositories;

use App\Models\VoucherSaleItem;
use Illuminate\Database\Eloquent\Collection;

class VoucherSaleItemRepository
{
    public function createMultiple(array $items): void
    {
        foreach ($items as $item) {
            VoucherSaleItem::create($item);
        }
    }

    public function findBySaleId(int $saleId): Collection
    {
        return VoucherSaleItem::where('voucher_sale_id', $saleId)
            ->with('voucherProduct')
            ->get();
    }
}

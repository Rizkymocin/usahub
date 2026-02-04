<?php

namespace App\Repositories;

use App\Models\VoucherStockRequestItem;

class VoucherStockRequestItemRepository
{
    /**
     * Create multiple items for a stock request
     */
    public function createMany(int $stockRequestId, array $items): void
    {
        foreach ($items as $item) {
            VoucherStockRequestItem::create([
                'stock_request_id' => $stockRequestId,
                'voucher_product_id' => $item['voucher_product_id'],
                'qty' => $item['qty'],
                'unit_price' => $item['unit_price'],
                'subtotal' => $item['qty'] * $item['unit_price'],
            ]);
        }
    }

    /**
     * Get all items for a stock request
     */
    public function findByStockRequest(int $stockRequestId)
    {
        return VoucherStockRequestItem::where('stock_request_id', $stockRequestId)
            ->with('voucher_product')
            ->get();
    }
}

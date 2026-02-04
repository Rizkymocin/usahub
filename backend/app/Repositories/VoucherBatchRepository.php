<?php

namespace App\Repositories;

use App\Models\VoucherBatch;
use App\Models\VoucherBatchItem;

class VoucherBatchRepository
{
    /**
     * Create new batch
     */
    public function create(array $data): VoucherBatch
    {
        return VoucherBatch::create($data);
    }

    /**
     * Create batch items
     */
    public function createItems(int $batchId, array $items): void
    {
        $data = [];

        foreach ($items as $item) {
            $data[] = [
                'batch_id' => $batchId,
                'voucher_product_id' => $item['voucher_product_id'],
                'qty' => $item['qty'],
                'unit_price' => $item['unit_price'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        VoucherBatchItem::insert($data);
    }

    /**
     * Find batch by ID with items
     */
    public function findById(int $id): ?VoucherBatch
    {
        return VoucherBatch::with(['items.voucherProduct', 'issuedBy', 'issuedToOutlet'])
            ->find($id);
    }

    /**
     * Get batches by business
     */
    public function findByBusiness(int $businessId)
    {
        return VoucherBatch::where('business_id', $businessId)
            ->with(['items.voucherProduct', 'issuedToOutlet'])
            ->orderBy('issued_at', 'desc')
            ->get();
    }
}

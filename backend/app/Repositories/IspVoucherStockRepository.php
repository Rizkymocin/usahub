<?php

namespace App\Repositories;

use App\Models\IspVoucherStock;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class IspVoucherStockRepository
{
    /**
     * Create a new stock entry
     */
    public function create(array $data): IspVoucherStock
    {
        return IspVoucherStock::create($data);
    }

    /**
     * Find stock by ID with relationships
     */
    public function findById(int $id): ?IspVoucherStock
    {
        return IspVoucherStock::with(['business', 'voucherProduct', 'createdBy'])
            ->find($id);
    }

    /**
     * Get all stocks for a business
     */
    public function findByBusiness(int $businessId): Collection
    {
        return IspVoucherStock::where('business_id', $businessId)
            ->with(['voucherProduct', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get aggregated stock summary per product for a business
     * Returns: voucher_product_id, product_name, total_quantity, total_value
     */
    public function getStockSummary(int $businessId): Collection
    {
        return IspVoucherStock::selectRaw('
                voucher_product_id,
                SUM(quantity) as total_quantity,
                SUM(quantity * default_selling_price) as total_value
            ')
            ->where('business_id', $businessId)
            ->groupBy('voucher_product_id')
            ->havingRaw('SUM(quantity) > 0')  // Use actual aggregate, not alias
            ->with('voucherProduct')
            ->get();
    }

    /**
     * Get available quantity for a specific product
     */
    public function getAvailableQuantity(int $businessId, int $voucherProductId): int
    {
        return IspVoucherStock::where('business_id', $businessId)
            ->where('voucher_product_id', $voucherProductId)
            ->sum('quantity');
    }

    /**
     * Update stock price
     */
    public function updatePrice(int $id, float $price): bool
    {
        return IspVoucherStock::where('id', $id)
            ->update(['default_selling_price' => $price]);
    }

    /**
     * Decrement stock quantity
     */
    public function decrementQuantity(int $businessId, int $voucherProductId, int $quantity): void
    {
        // Find the oldest stock entry with available quantity (FIFO)
        $stock = IspVoucherStock::where('business_id', $businessId)
            ->where('voucher_product_id', $voucherProductId)
            ->where('quantity', '>', 0)
            ->orderBy('created_at', 'asc')
            ->first();

        if (!$stock) {
            throw new \Exception('No stock available for this product');
        }

        if ($stock->quantity >= $quantity) {
            // Sufficient quantity in this stock entry
            $stock->decrementQuantity($quantity);
        } else {
            // Need to use multiple stock entries
            $remaining = $quantity;
            while ($remaining > 0) {
                $stock = IspVoucherStock::where('business_id', $businessId)
                    ->where('voucher_product_id', $voucherProductId)
                    ->where('quantity', '>', 0)
                    ->orderBy('created_at', 'asc')
                    ->first();

                if (!$stock) {
                    throw new \Exception('Insufficient stock for this product');
                }

                $qtyToDeduct = min($remaining, $stock->quantity);
                $stock->decrementQuantity($qtyToDeduct);
                $remaining -= $qtyToDeduct;
            }
        }
    }

    /**
     * Delete stock entry
     */
    /**
     * Decrement quantity for a specific stock ID
     */
    public function decrementStockId(int $stockId, int $quantity): void
    {
        $stock = $this->findById($stockId);
        if (!$stock) {
            throw new \Exception('Stock not found');
        }

        if ($stock->quantity < $quantity) {
            throw new \Exception('Insufficient stock quantity in this batch');
        }

        $stock->decrement('quantity', $quantity);
    }

    public function delete(int $id): bool
    {
        return IspVoucherStock::where('id', $id)->delete();
    }
}

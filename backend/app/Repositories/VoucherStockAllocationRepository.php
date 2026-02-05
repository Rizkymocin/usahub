<?php

namespace App\Repositories;

use App\Models\VoucherStockAllocation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VoucherStockAllocationRepository
{
    /**
     * Create a new allocation
     */
    public function create(array $data): VoucherStockAllocation
    {
        return VoucherStockAllocation::create($data);
    }

    /**
     * Find allocation by ID
     */
    public function findById(int $id): ?VoucherStockAllocation
    {
        return VoucherStockAllocation::with([
            'allocatedTo',
            'voucherProduct',
            'allocatedBy',
            'stockRequest'
        ])->find($id);
    }

    /**
     * Get aggregated stock summary per product for a finance user
     * Returns: voucher_product_id, total_allocated, total_sold, qty_available
     */
    public function getFinanceStock(int $userId): Collection
    {
        return VoucherStockAllocation::query()
            ->select([
                'voucher_product_id',
                DB::raw('SUM(qty_allocated) as total_allocated'),
                DB::raw('SUM(qty_sold) as total_sold'),
                DB::raw('SUM(qty_allocated - qty_sold) as qty_available')
            ])
            ->where('allocated_to_user_id', $userId)
            ->where('status', 'active')
            ->with('voucherProduct')
            ->groupBy('voucher_product_id')
            ->get();
    }

    /**
     * Get active allocations for a user, optionally filtered by product
     */
    public function getActiveAllocations(int $userId, ?int $voucherProductId = null): Collection
    {
        $query = VoucherStockAllocation::query()
            ->where('allocated_to_user_id', $userId)
            ->where('status', 'active')
            ->with(['voucherProduct', 'allocatedBy']);

        if ($voucherProductId) {
            $query->where('voucher_product_id', $voucherProductId);
        }

        return $query->orderBy('allocated_at', 'desc')->get();
    }

    /**
     * Get all allocations for a business (admin view)
     */
    public function getAllByBusiness(int $businessId): Collection
    {
        return VoucherStockAllocation::query()
            ->where('business_id', $businessId)
            ->with([
                'allocatedTo',
                'voucherProduct',
                'allocatedBy',
                'stockRequest'
            ])
            ->orderBy('allocated_at', 'desc')
            ->get();
    }

    /**
     * Increment qty_sold for an allocation
     */
    public function incrementSold(int $allocationId, int $quantity): void
    {
        $allocation = VoucherStockAllocation::findOrFail($allocationId);
        $allocation->incrementSold($quantity);
    }

    /**
     * Close an allocation
     */
    public function closeAllocation(int $allocationId): void
    {
        $allocation = VoucherStockAllocation::findOrFail($allocationId);
        $allocation->close();
    }

    /**
     * Get total available quantity for a user and product
     */
    public function getAvailableQuantity(int $userId, int $voucherProductId): int
    {
        return VoucherStockAllocation::query()
            ->where('allocated_to_user_id', $userId)
            ->where('voucher_product_id', $voucherProductId)
            ->where('status', 'active')
            ->sum(DB::raw('qty_allocated - qty_sold'));
    }

    /**
     * Find oldest active allocation with available stock for user+product
     * Used for FIFO (First In First Out) when recording sales
     */
    public function findOldestAvailableAllocation(int $userId, int $voucherProductId): ?VoucherStockAllocation
    {
        return VoucherStockAllocation::query()
            ->where('allocated_to_user_id', $userId)
            ->where('voucher_product_id', $voucherProductId)
            ->where('status', 'active')
            ->whereRaw('qty_sold < qty_allocated')
            ->orderBy('allocated_at', 'asc')
            ->first();
    }
}

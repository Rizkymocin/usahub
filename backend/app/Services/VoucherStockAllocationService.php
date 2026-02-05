<?php

namespace App\Services;

use App\Models\VoucherStockAllocation;
use App\Repositories\VoucherStockAllocationRepository;
use Illuminate\Database\Eloquent\Collection;

class VoucherStockAllocationService
{
    public function __construct(
        private VoucherStockAllocationRepository $allocationRepository
    ) {}

    /**
     * Get stock summary for finance user dashboard
     */
    public function getFinanceStockSummary(int $userId): Collection
    {
        return $this->allocationRepository->getFinanceStock($userId);
    }

    /**
     * Get all allocations for a business (admin view)
     */
    public function getBusinessAllocations(int $businessId): Collection
    {
        return $this->allocationRepository->getAllByBusiness($businessId);
    }

    /**
     * Create manual allocation (admin creates allocation directly)
     */
    public function createManualAllocation(array $data): VoucherStockAllocation
    {
        $allocationData = [
            'tenant_id' => $data['tenant_id'],
            'business_id' => $data['business_id'],
            'allocated_to_user_id' => $data['allocated_to_user_id'],
            'voucher_product_id' => $data['voucher_product_id'],
            'qty_allocated' => $data['qty_allocated'],
            'qty_sold' => 0,
            'source_type' => 'manual',
            'source_id' => null,
            'status' => 'active',
            'allocated_at' => now(),
            'allocated_by_user_id' => $data['allocated_by_user_id'],
            'notes' => $data['notes'] ?? null,
        ];

        return $this->allocationRepository->create($allocationData);
    }

    /**
     * Validate if finance user has enough stock to sell
     */
    public function validateAllocationAvailability(int $userId, int $voucherProductId, int $quantity): bool
    {
        $available = $this->allocationRepository->getAvailableQuantity($userId, $voucherProductId);
        return $available >= $quantity;
    }

    /**
     * Record a sale and decrement allocation stock using FIFO
     */
    public function recordSale(int $userId, int $voucherProductId, int $quantity): void
    {
        $remainingQty = $quantity;

        while ($remainingQty > 0) {
            // Find oldest allocation with available stock (FIFO)
            $allocation = $this->allocationRepository->findOldestAvailableAllocation($userId, $voucherProductId);

            if (!$allocation) {
                throw new \Exception('Insufficient allocation stock for this sale');
            }

            $availableInAllocation = $allocation->qty_allocated - $allocation->qty_sold;
            $qtyToDeduct = min($remainingQty, $availableInAllocation);

            // Increment sold quantity
            $this->allocationRepository->incrementSold($allocation->id, $qtyToDeduct);

            $remainingQty -= $qtyToDeduct;
        }
    }

    /**
     * Close an allocation manually
     */
    public function closeAllocation(int $allocationId): void
    {
        $this->allocationRepository->closeAllocation($allocationId);
    }

    /**
     * Get active allocations for a user
     */
    public function getActiveAllocations(int $userId, ?int $voucherProductId = null): Collection
    {
        return $this->allocationRepository->getActiveAllocations($userId, $voucherProductId);
    }
}

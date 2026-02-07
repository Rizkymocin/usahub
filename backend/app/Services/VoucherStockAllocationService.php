<?php

namespace App\Services;

use App\Models\VoucherStockAllocation;
use App\Repositories\VoucherStockAllocationRepository;
use Illuminate\Database\Eloquent\Collection;
use App\Repositories\IspVoucherStockAdjustmentRepository;
use Illuminate\Support\Facades\Auth;

class VoucherStockAllocationService
{
    public function __construct(
        private VoucherStockAllocationRepository $allocationRepository,
        private IspVoucherStockAdjustmentRepository $adjustmentRepository
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
            'qty_damaged' => 0,
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

            $availableInAllocation = $allocation->qty_allocated - $allocation->qty_sold - ($allocation->qty_damaged ?? 0);
            $qtyToDeduct = min($remainingQty, $availableInAllocation);

            // Increment sold quantity
            $this->allocationRepository->incrementSold($allocation->id, $qtyToDeduct);

            $remainingQty -= $qtyToDeduct;
        }
    }

    /**
     * Report damage for an allocated stock
     */
    public function reportDamage(int $allocationId, int $quantity, string $reason, ?string $notes = null, ?array $files = null): void
    {
        $allocation = $this->allocationRepository->findById($allocationId);
        if (!$allocation) {
            throw new \Exception('Allocation not found');
        }

        $available = $allocation->qty_allocated - $allocation->qty_sold - $allocation->qty_damaged;
        if ($quantity > $available) {
            throw new \Exception('Insufficient available quantity in this allocation');
        }

        // 1. Increment damaged quantity
        $this->allocationRepository->incrementDamaged($allocationId, $quantity);

        // 2. Handle file upload (similar to stock service)
        $attachmentPath = null;
        if ($files && isset($files[0])) {
            $attachmentPath = $files[0]->store('adjustments', 'public');
        }

        // 3. Create adjustment record
        $this->adjustmentRepository->create([
            'tenant_id' => $allocation->tenant_id,
            'business_id' => $allocation->business_id,
            'voucher_product_id' => $allocation->voucher_product_id,
            'quantity' => -$quantity,
            'adjustment_type' => $reason,
            'source_type' => 'allocation',
            'source_id' => $allocation->id,
            'notes' => $notes,
            'attachment_path' => $attachmentPath,
            'created_by_user_id' => Auth::id(),
        ]);
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

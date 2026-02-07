<?php

namespace App\Repositories;

use App\Models\VoucherStockRequest;
use Illuminate\Database\Eloquent\Collection;

class VoucherStockRequestRepository
{
    /**
     * Get all requests for a business
     */
    public function findByBusiness(int $businessId, ?string $status = null, ?int $userId = null): Collection
    {
        $query = VoucherStockRequest::where('business_id', $businessId)
            ->with(['requestedBy', 'processedBy', 'outlet', 'items.voucher_product']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($userId) {
            $query->where('requested_by_user_id', $userId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Find request by ID with relationships
     */
    public function findById(int $id): ?VoucherStockRequest
    {
        return VoucherStockRequest::with(['requestedBy', 'processedBy', 'outlet', 'items.voucher_product'])
            ->find($id);
    }

    /**
     * Create new request
     */
    public function create(array $data): VoucherStockRequest
    {
        return VoucherStockRequest::create($data);
    }

    /**
     * Update request
     */
    public function update(int $id, array $data): bool
    {
        return VoucherStockRequest::where('id', $id)->update($data);
    }

    /**
     * Delete request
     */
    public function delete(int $id): bool
    {
        return VoucherStockRequest::where('id', $id)->delete();
    }
}

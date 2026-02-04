<?php

namespace App\Repositories;

use App\Models\VoucherStockRequest;
use Illuminate\Database\Eloquent\Collection;

class VoucherStockRequestRepository
{
    /**
     * Get all requests for a business
     */
    public function findByBusiness(int $businessId, ?string $status = null): Collection
    {
        $query = VoucherStockRequest::where('business_id', $businessId)
            ->with(['requestedBy', 'processedBy', 'outlet', 'items.voucherProduct']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Find request by ID with relationships
     */
    public function findById(int $id): ?VoucherStockRequest
    {
        return VoucherStockRequest::with(['requestedBy', 'processedBy', 'outlet', 'items.voucherProduct'])
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

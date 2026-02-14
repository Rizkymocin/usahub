<?php

namespace App\Repositories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Collection;

class BusinessRepository
{
    public function getAll(int $tenantId): Collection
    {
        return Business::where('tenant_id', $tenantId)->withCount('accounts')->get();
    }

    public function findById(int $id, int $tenantId): ?Business
    {
        return Business::where('tenant_id', $tenantId)->withCount('accounts')->find($id);
    }

    public function findByIdPublicId(string $public_id, ?int $tenantId): ?Business
    {
        $query = Business::withCount('accounts')->where('public_id', $public_id);

        if ($tenantId !== null) {
            $query->where('tenant_id', $tenantId);
        }

        return $query->first();
    }

    public function findByPublicId(string $public_id, ?int $tenantId): ?Business
    {
        return $this->findByIdPublicId($public_id, $tenantId);
    }

    public function create(array $data): Business
    {
        return Business::create($data);
    }

    public function update(int $id, int $tenantId, array $data): bool
    {
        $business = $this->findById($id, $tenantId);
        if ($business) {
            return $business->update($data);
        }
        return false;
    }

    public function delete(int $id, int $tenantId): bool
    {
        $business = $this->findById($id, $tenantId);
        if ($business) {
            return $business->delete();
        }
        return false;
    }
}

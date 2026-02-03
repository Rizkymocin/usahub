<?php

namespace App\Repositories;

use App\Models\IspOutlet;
use Illuminate\Database\Eloquent\Collection;

class IspOutletRepository
{
    public function getAll(int $tenantId, int $businessId): Collection
    {
        return IspOutlet::where('tenant_id', $tenantId)
            ->where('business_id', $businessId)
            ->get();
    }

    public function findById(int $id, int $tenantId): ?IspOutlet
    {
        return IspOutlet::where('tenant_id', $tenantId)->find($id);
    }

    public function findByPublicId(string $publicId, int $tenantId): ?IspOutlet
    {
        return IspOutlet::where('tenant_id', $tenantId)
            ->where('public_id', $publicId)
            ->first();
    }

    public function create(array $data): IspOutlet
    {
        return IspOutlet::create($data);
    }

    public function update(int $id, int $tenantId, array $data): bool
    {
        $outlet = $this->findById($id, $tenantId);
        if ($outlet) {
            return $outlet->update($data);
        }
        return false;
    }

    public function delete(int $id, int $tenantId): bool
    {
        $outlet = $this->findById($id, $tenantId);
        if ($outlet) {
            return $outlet->delete();
        }
        return false;
    }
}

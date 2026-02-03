<?php

namespace App\Repositories;

use App\Models\IspReseller;
use Illuminate\Database\Eloquent\Collection;

class IspResellerRepository
{
    public function getAll(int $tenantId): Collection
    {
        return IspReseller::where('tenant_id', $tenantId)->get();
    }

    public function findById(int $id, int $tenantId): ?IspReseller
    {
        return IspReseller::where('tenant_id', $tenantId)->find($id);
    }

    public function findByCode(string $code, int $tenantId): ?IspReseller
    {
        return IspReseller::where('tenant_id', $tenantId)
            ->where('code', $code)
            ->first();
    }

    public function create(array $data): IspReseller
    {
        return IspReseller::create($data);
    }

    public function update(int $id, int $tenantId, array $data): bool
    {
        $reseller = $this->findById($id, $tenantId);
        if ($reseller) {
            return $reseller->update($data);
        }
        return false;
    }

    public function updateByCode(string $code, int $tenantId, array $data): bool
    {
        $reseller = $this->findByCode($code, $tenantId);
        if ($reseller) {
            return $reseller->update($data);
        }
        return false;
    }

    public function delete(int $id, int $tenantId): bool
    {
        $reseller = $this->findById($id, $tenantId);
        if ($reseller) {
            return $reseller->delete();
        }
        return false;
    }

    public function deleteByCode(string $code, int $tenantId): bool
    {
        $reseller = $this->findByCode($code, $tenantId);
        if ($reseller) {
            return $reseller->delete();
        }
        return false;
    }
}

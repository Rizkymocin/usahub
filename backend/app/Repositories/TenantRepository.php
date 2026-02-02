<?php

namespace App\Repositories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

class TenantRepository
{
    public function getAll(): Collection
    {
        return Tenant::with(['owner', 'plan'])->get();
    }

    public function findById(int $id): ?Tenant
    {
        return Tenant::with(['owner', 'plan'])->find($id);
    }

    public function create(array $data): Tenant
    {
        return Tenant::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $tenant = $this->findById($id);
        if ($tenant) {
            return $tenant->update($data);
        }
        return false;
    }

    public function delete(int $id): bool
    {
        $tenant = $this->findById($id);
        if ($tenant) {
            return $tenant->delete();
        }
        return false;
    }
}

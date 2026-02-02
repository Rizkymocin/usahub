<?php

namespace App\Services;

use App\Repositories\TenantRepository;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class TenantService
{
    protected $repository;

    public function __construct(TenantRepository $repository)
    {
        $this->repository = $repository;
    }

    public function listTenants(): Collection
    {
        return $this->repository->getAll();
    }

    public function getTenant(int $id): ?Tenant
    {
        return $this->repository->findById($id);
    }

    public function createTenant(array $data): Tenant
    {
        if (!isset($data['public_id'])) {
            $data['public_id'] = (string) Str::uuid();
        }
        return $this->repository->create($data);
    }

    public function updateTenant(int $id, array $data): bool
    {
        return $this->repository->update($id, $data);
    }

    public function deleteTenant(int $id): bool
    {
        return $this->repository->delete($id);
    }
}

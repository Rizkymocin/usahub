<?php

namespace App\Services;

use App\Repositories\IspOutletRepository;
use App\Repositories\IspOutletTopupRepository;
use App\Models\IspOutlet;
use App\Models\IspOutletTopup;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class IspOutletService
{
    public $repository;
    public $topupRepository;

    public function __construct(
        IspOutletRepository $repository,
        IspOutletTopupRepository $topupRepository
    ) {
        $this->repository = $repository;
        $this->topupRepository = $topupRepository;
    }

    public function listOutlets(int $tenantId, int $businessId): Collection
    {
        return $this->repository->getAll($tenantId, $businessId);
    }

    public function getOutlet(int $id, int $tenantId): ?IspOutlet
    {
        return $this->repository->findById($id, $tenantId);
    }

    public function getOutletByPublicId(string $publicId, int $tenantId): ?IspOutlet
    {
        return $this->repository->findByPublicId($publicId, $tenantId);
    }

    public function createOutlet(array $data, int $tenantId, int $businessId): IspOutlet
    {
        // Prepare outlet data
        $outletData = [
            'public_id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'business_id' => $businessId,
            'user_id' => null,
            'name' => $data['name'],
            'phone' => $data['phone'] ?? '',
            'address' => $data['address'] ?? '',
            'current_balance' => 0,
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        return $this->repository->create($outletData);
    }



    public function updateOutlet(int $id, int $tenantId, array $data): bool
    {
        $outlet = $this->repository->findById($id, $tenantId);
        if (!$outlet) {
            return false;
        }

        return $this->repository->update($id, $tenantId, $data);
    }

    public function deleteOutlet(int $id, int $tenantId): bool
    {
        $outlet = $this->repository->findById($id, $tenantId);
        if (!$outlet) {
            return false;
        }
        return $this->repository->delete($id, $tenantId);
    }

    public function updateOutletByPublicId(string $publicId, int $tenantId, array $data): bool
    {
        $outlet = $this->repository->findByPublicId($publicId, $tenantId);
        if (!$outlet) {
            return false;
        }

        return $this->repository->update($outlet->id, $tenantId, $data);
    }

    public function deleteOutletByPublicId(string $publicId, int $tenantId): bool
    {
        $outlet = $this->repository->findByPublicId($publicId, $tenantId);
        if (!$outlet) {
            return false;
        }

        return $this->repository->delete($outlet->id, $tenantId);
    }
}

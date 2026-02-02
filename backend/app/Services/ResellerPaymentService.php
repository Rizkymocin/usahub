<?php

namespace App\Services;

use App\Repositories\ResellerPaymentRepository;
use App\Models\ResellerPayment;
use Illuminate\Support\Collection;

class ResellerPaymentService
{
    protected $repository;

    public function __construct(ResellerPaymentRepository $repository)
    {
        $this->repository = $repository;
    }

    public function listPayments(int $tenantId, int $businessId): Collection
    {
        return $this->repository->getAll($tenantId, $businessId);
    }

    public function getPayment(int $id, int $tenantId, int $businessId): ?ResellerPayment
    {
        return $this->repository->findById($id, $tenantId, $businessId);
    }

    public function storePayment(array $data): ResellerPayment
    {
        // Add business logic here if needed (e.g. check invoice balance)
        return $this->repository->create($data);
    }

    public function updatePayment(int $id, array $data, int $tenantId, int $businessId): bool
    {
        return $this->repository->update($id, $data, $tenantId, $businessId);
    }

    public function deletePayment(int $id, int $tenantId, int $businessId): bool
    {
        return $this->repository->delete($id, $tenantId, $businessId);
    }
}

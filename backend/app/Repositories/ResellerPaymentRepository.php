<?php

namespace App\Repositories;

use App\Models\ResellerPayment;
use Illuminate\Support\Collection;

class ResellerPaymentRepository
{
    protected $model;

    public function __construct(ResellerPayment $model)
    {
        $this->model = $model;
    }

    public function getAll(int $tenantId, int $businessId): Collection
    {
        return $this->model->where('tenant_id', $tenantId)
            ->where('business_id', $businessId)
            ->get();
    }

    public function findById(int $id, int $tenantId, int $businessId): ?ResellerPayment
    {
        return $this->model->where('tenant_id', $tenantId)
            ->where('business_id', $businessId)
            ->find($id);
    }

    public function create(array $data): ResellerPayment
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data, int $tenantId, int $businessId): bool
    {
        $payment = $this->findById($id, $tenantId, $businessId);
        if (!$payment) {
            return false;
        }
        return $payment->update($data);
    }

    public function delete(int $id, int $tenantId, int $businessId): bool
    {
        $payment = $this->findById($id, $tenantId, $businessId);
        if (!$payment) {
            return false;
        }
        return $payment->delete();
    }
}

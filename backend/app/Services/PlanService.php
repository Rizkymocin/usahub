<?php

namespace App\Services;

use App\Repositories\PlanRepository;
use App\Models\Plan;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class PlanService
{
    protected $repository;

    public function __construct(PlanRepository $repository)
    {
        $this->repository = $repository;
    }

    public function listPlans(): Collection
    {
        return $this->repository->getAll();
    }

    public function getPlan(int $id): ?Plan
    {
        return $this->repository->findById($id);
    }

    public function createPlan(array $data): Plan
    {
        if (!isset($data['public_id'])) {
            $data['public_id'] = (string) Str::uuid();
        }
        return $this->repository->create($data);
    }

    public function updatePlan(int $id, array $data): bool
    {
        return $this->repository->update($id, $data);
    }

    public function deletePlan(int $id): bool
    {
        return $this->repository->delete($id);
    }
}

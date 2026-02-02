<?php

namespace App\Repositories;

use App\Models\Plan;
use Illuminate\Support\Collection;

class PlanRepository
{
    protected $model;

    public function __construct(Plan $model)
    {
        $this->model = $model;
    }

    public function getAll(): Collection
    {
        return $this->model->all();
    }

    public function findById(int $id): ?Plan
    {
        return $this->model->find($id);
    }

    public function findByPublicId(string $publicId): ?Plan
    {
        return $this->model->where('public_id', $publicId)->first();
    }

    public function create(array $data): Plan
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $plan = $this->findById($id);
        if (!$plan) {
            return false;
        }
        return $plan->update($data);
    }

    public function delete(int $id): bool
    {
        $plan = $this->findById($id);
        if (!$plan) {
            return false;
        }
        return $plan->delete();
    }
}

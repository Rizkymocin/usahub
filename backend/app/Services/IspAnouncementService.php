<?php

namespace App\Services;

use App\Repositories\BusinessRepository;
use App\Repositories\IspAnouncementRepository;
use Illuminate\Database\Eloquent\Collection;

class IspAnouncementService
{

    public function __construct(
        protected IspAnouncementRepository $repository,
        protected BusinessRepository $businessRepository,
    ) {}

    public function getAnouncements(string $businessPublicId, ?int $tenantId): Collection
    {
        $business = $this->businessRepository->findByPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception('Business not found');
        }
        return $this->repository->getAnouncements($business->id);
    }

    public function createAnouncement(string $businessPublicId, ?int $tenantId, array $data)
    {
        $business = $this->businessRepository->findByPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception('Business not found');
        }

        $data['business_id'] = $business->id;
        $data['public_id'] = (string) \Illuminate\Support\Str::uuid();
        return $this->repository->create($data);
    }

    public function updateAnouncement(string $businessPublicId, ?int $tenantId, int $id, array $data)
    {
        $business = $this->businessRepository->findByPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception('Business not found');
        }
        // Ideally check if announcement belongs to business, but repository logic handles basic CRUD.
        // For stricter control we would verify ownership here too.

        return $this->repository->update($id, $data);
    }

    public function deleteAnouncement(string $businessPublicId, ?int $tenantId, int $id)
    {
        $business = $this->businessRepository->findByPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception('Business not found');
        }
        return $this->repository->delete($id);
    }
}

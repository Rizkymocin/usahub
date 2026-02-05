<?php

namespace App\Services;

use App\Repositories\IspOutletRepository;
use App\Repositories\UserRepository;
use App\Repositories\IspOutletTopupRepository;
use App\Models\IspOutlet;
use App\Models\User;
use App\Models\IspOutletTopup;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class IspOutletService
{
    public $repository;
    public $userRepository;
    public $topupRepository;

    public function __construct(
        IspOutletRepository $repository,
        UserRepository $userRepository,
        IspOutletTopupRepository $topupRepository
    ) {
        $this->repository = $repository;
        $this->userRepository = $userRepository;
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
        return DB::transaction(function () use ($data, $tenantId, $businessId) {
            // Create user account for the outlet
            $user = $this->createOutletUser($data);

            // Prepare outlet data
            $outletData = [
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'user_id' => $user->id,
                'name' => $data['name'],
                'phone' => $data['phone'] ?? '',
                'address' => $data['address'] ?? '',
                'current_balance' => 0,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            return $this->repository->create($outletData);
        });
    }

    private function createOutletUser(array $data): User
    {
        // Use provided email or generate one
        $email = $data['email'] ?? ('outlet.' . Str::slug($data['name']) . '.' . rand(100, 999) . '@' . env('APP_DOMAIN'));

        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $email,
            'password' => Hash::make($data['password'] ?? 'outlet123'), // Default password
        ]);

        // Assign isp_outlet role
        $user->assignRole('isp_outlet');

        return $user;
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
        $user_id = $outlet->user_id;

        $deleteOutlet = $this->repository->delete($outlet->id, $tenantId);
        $deleteUser = $this->userRepository->delete($user_id);

        return $deleteOutlet && $deleteUser;
    }
}

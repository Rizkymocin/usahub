<?php

namespace App\Services;

use App\Repositories\BusinessRepository;
use App\Models\Business;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class BusinessService
{
    public $repository;

    public function __construct(BusinessRepository $repository)
    {
        $this->repository = $repository;
    }

    public function listBusinesses(int $tenantId): Collection
    {
        return $this->repository->getAll($tenantId);
    }

    public function getBusinessesForUser(\App\Models\User $user): Collection
    {
        return $user->businesses()->withCount('accounts')->get();
    }

    public function getBusiness(int $id, int $tenantId): ?Business
    {
        return $this->repository->findById($id, $tenantId);
    }

    public function getBusinessByPublicId(string $publicId, int $tenantId): ?Business
    {
        return $this->repository->findByIdPublicId($publicId, $tenantId);
    }

    public function createBusiness(array $data, int $tenantId): Business
    {
        // 1. Check Subscription Limits
        $tenant = \App\Models\Tenant::with('plan')->find($tenantId);
        if (!$tenant || !$tenant->plan) {
            throw new \Exception("Tenant or Plan not found.");
        }

        $currentBusinessCount = $this->repository->getAll($tenantId)->count();
        if ($currentBusinessCount >= $tenant->plan->max_business) {
            throw new \Exception("Limit usaha tercapai untuk paket " . $tenant->plan->name . ". Silakan upgrade paket anda.");
        }

        if (!isset($data['public_id'])) {
            $data['public_id'] = (string) Str::uuid();
        }
        $data['tenant_id'] = $tenantId;

        return \Illuminate\Support\Facades\DB::transaction(function () use ($data, $tenantId) {
            $business = $this->repository->create($data);
            $this->createDefaultAccounts($business);
            return $business;
        });
    }

    private function createDefaultAccounts(Business $business)
    {
        $accounts = [
            ['name' => 'Pendapatan', 'type' => 'revenue', 'code' => '1000'],
            ['name' => 'Pengeluaran', 'type' => 'expense', 'code' => '2000'],
            ['name' => 'Modal', 'type' => 'equity', 'code' => '3000'],
            ['name' => 'Aset', 'type' => 'asset', 'code' => '4000'],
            ['name' => 'Hutang', 'type' => 'liability', 'code' => '5000'],
        ];

        foreach ($accounts as $acc) {
            \App\Models\Account::create([
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $business->tenant_id,
                'business_id' => $business->id,
                'name' => $acc['name'],
                'type' => $acc['type'],
                'code' => $acc['code'],
                'is_active' => true,
                'parent_id' => null, // Root accounts
            ]);
        }
    }

    public function updateBusiness(string $public_id, int $tenantId, array $data): bool
    {
        $business = $this->repository->findByIdPublicId($public_id, $tenantId);
        if (!$business) {
            return false;
        }

        // Check if category is creating change
        if (isset($data['category']) && $data['category'] !== $business->category) {
            // Default accounts are 5. If more, it means user added custom accounts.
            if ($business->accounts_count > 5) {
                throw new \Exception("Kategori tidak dapat diubah karena akun sudah dimodifikasi/ditambahkan.");
            }
        }

        return $this->repository->update($business->id, $tenantId, $data);
    }

    public function deleteBusiness(string $public_id, int $tenantId): bool
    {
        $business = $this->repository->findByIdPublicId($public_id, $tenantId);
        if (!$business) {
            return false;
        }
        return $this->repository->delete($business->id, $tenantId);
    }

    public function getBusinessUsers(string $businessPublicId, int $tenantId): ?Collection
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return null;
        }

        // Append role to each user for frontend display
        $business->users->each(function ($user) {
            $user->role = $user->getRoleNames()->first();
        });

        return $business->users;
    }

    public function createBusinessUser(array $data, string $businessPublicId, int $tenantId): \App\Models\User
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception("Business not found.");
        }

        // Determine default password based on role
        $password = match ($data['role']) {
            'kasir' => 'kasir123',
            'business_admin' => 'admin123',
            'isp_outlet' => 'outlet123',
            'isp_teknisi' => 'teknisi123',
            default => 'password123', // Fallback
        };

        return \Illuminate\Support\Facades\DB::transaction(function () use ($data, $business, $tenantId, $password) {
            // Check if user already exists
            $existingUser = \App\Models\User::where('email', $data['email'])->first();
            if ($existingUser) {
                throw new \Exception("User with this email already exists.");
            }

            $user = \App\Models\User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($password),
            ]);

            // Assign Role using Spatie
            $user->assignRole($data['role']);

            // Attach to BusinessPivot
            $business->users()->attach($user->id, [
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'is_active' => true,
                'joined_at' => now(),
            ]);

            // Append role for response
            $user->role = $data['role'];

            return $user;
        });
    }
}

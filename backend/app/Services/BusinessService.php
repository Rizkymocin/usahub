<?php

namespace App\Services;

use App\Repositories\BusinessRepository;
use App\Repositories\UserRepository;
use App\Repositories\TenantRepository;
use App\Repositories\AccountRepository;
use App\Repositories\IspResellerRepository;
use App\Models\Business;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class BusinessService
{
    public $repository;
    public $userRepository;
    public $tenantRepository;
    public $accountRepository;
    public $ispOutletService;
    public $ispResellerRepository;
    public $ispMaintenanceService;

    public function __construct(
        BusinessRepository $repository,
        UserRepository $userRepository,
        TenantRepository $tenantRepository,
        AccountRepository $accountRepository,
        IspOutletService $ispOutletService,
        IspResellerRepository $ispResellerRepository,
        IspMaintenanceService $ispMaintenanceService
    ) {
        $this->repository = $repository;
        $this->userRepository = $userRepository;
        $this->tenantRepository = $tenantRepository;
        $this->accountRepository = $accountRepository;
        $this->ispOutletService = $ispOutletService;
        $this->ispResellerRepository = $ispResellerRepository;
        $this->ispMaintenanceService = $ispMaintenanceService;
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
        $tenant = $this->tenantRepository->findById($tenantId);
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

            // If ISP business, create default outlet
            if (isset($data['category']) && $data['category'] === 'isp') {
                $this->createDefaultOutlet($business, $tenantId);
            }

            return $business;
        });
    }

    private function createDefaultAccounts(Business $business)
    {
        $rootAccounts = [
            ['code' => '1000', 'name' => 'Aset Lancar', 'type' => 'asset'],
            ['code' => '2000', 'name' => 'Kewajiban', 'type' => 'liability'],
            ['code' => '4000', 'name' => 'Pendapatan', 'type' => 'revenue'],
            ['code' => '5000', 'name' => 'Beban', 'type' => 'expense'],
        ];

        $parents = [];

        foreach ($rootAccounts as $acc) {
            $account = $this->accountRepository->create([
                'public_id'   => (string) Str::uuid(),
                'tenant_id'   => $business->tenant_id,
                'business_id' => $business->id,
                'name'        => $acc['name'],
                'type'        => $acc['type'],
                'code'        => $acc['code'],
                'is_active'   => true,
                'parent_id'   => null,
            ]);

            // simpan parent berdasarkan code
            $parents[$acc['code']] = $account->id;
        }

        $childAccounts = [
            // Aset Lancar (1000)
            ['code' => '1010', 'name' => 'Kas', 'type' => 'asset', 'parent' => '1000'],
            ['code' => '1020', 'name' => 'Bank', 'type' => 'asset', 'parent' => '1000'],

            // Kewajiban (2000)
            ['code' => '2010', 'name' => 'Deposit Outlet', 'type' => 'liability', 'parent' => '2000'],
            ['code' => '2020', 'name' => 'Utang Fee Reseller', 'type' => 'liability', 'parent' => '2000'],

            // Pendapatan (4000)
            ['code' => '4010', 'name' => 'Penjualan Voucher Internet', 'type' => 'revenue', 'parent' => '4000'],

            // Beban (5000)
            ['code' => '5010', 'name' => 'Fee Reseller', 'type' => 'expense', 'parent' => '5000'],
        ];

        foreach ($childAccounts as $acc) {
            $this->accountRepository->create([
                'public_id'   => (string) Str::uuid(),
                'tenant_id'   => $business->tenant_id,
                'business_id' => $business->id,
                'name'        => $acc['name'],
                'type'        => $acc['type'],
                'code'        => $acc['code'],
                'is_active'   => true,
                'parent_id'   => $parents[$acc['parent']],
            ]);
        }
    }

    private function createDefaultOutlet(Business $business, int $tenantId)
    {
        $outletName = $business->name . ' Admin';

        // Create default outlet using the IspOutletService
        $this->ispOutletService->createOutlet([
            'name' => $outletName,
            'email' => 'admin@' . strtolower(str_replace(' ', '', $business->name)) . '.local',
            'phone' => '',
            'address' => '',
            'role' => 'isp_outlet',
        ], $tenantId, $business->id);
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
            $user->role_names = $user->getRoleNames(); // Return all roles as strings
            $user->role = $user->role_names->first(function ($role) {
                return in_array($role, ['business_admin', 'kasir']);
            }) ?? $user->role_names->first(); // Fallback to first role
        });

        return $business->users;
    }

    public function createBusinessUser(array $data, string $businessPublicId, int $tenantId): \App\Models\User
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception("Business not found.");
        }

        // Standardize roles to array
        $roles = is_array($data['role']) ? $data['role'] : [$data['role']];

        // Determine default password based on primary role (first one)
        // You might want a better priority logic here if needed
        $primaryRole = $roles[0] ?? 'default';
        $password = match ($primaryRole) {
            'kasir' => 'kasir123',
            'business_admin' => 'admin123',
            'isp_outlet' => 'outlet123',
            'isp_teknisi' => 'teknisi123',
            'finance' => 'finance123',
            'teknisi_maintenance' => 'teknisi123',
            'teknisi_pasang_baru' => 'teknisi123',
            'sales' => 'sales123',
            default => 'password123',
        };

        return \Illuminate\Support\Facades\DB::transaction(function () use ($data, $business, $tenantId, $password, $roles) {
            // Check if user already exists
            $existingUser = $this->userRepository->findByEmail($data['email']);
            if ($existingUser) {
                throw new \Exception("User with this email already exists.");
            }

            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($password),
            ]);

            // Assign Roles using Spatie
            $user->syncRoles($roles);

            // Attach to BusinessPivot
            $business->users()->attach($user->id, [
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'is_active' => true,
                'joined_at' => now(),
            ]);

            // Append roles for response
            $user->role_names = $roles;
            $user->role = $roles[0] ?? null; // Backward compatibility

            return $user;
        });
    }

    public function createBusinessOutlet(array $data, string $businessPublicId, int $tenantId): \App\Models\IspOutlet
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception("Business not found.");
        }

        return $this->ispOutletService->createOutlet($data, $tenantId, $business->id);
    }

    public function getBusinessOutlets(string $businessPublicId, int $tenantId): ?Collection
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return null;
        }

        return $business->outlets;
    }

    public function updateBusinessOutlet(string $businessPublicId, string $outletPublicId, int $tenantId, array $data): bool
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return false;
        }

        return $this->ispOutletService->updateOutletByPublicId($outletPublicId, $tenantId, $data);
    }

    public function deleteBusinessOutlet(string $businessPublicId, string $outletPublicId, int $tenantId): bool
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return false;
        }

        return $this->ispOutletService->deleteOutletByPublicId($outletPublicId, $tenantId);
    }

    public function getBusinessResellers(string $businessPublicId, int $tenantId): ?Collection
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return null;
        }

        return $business->resellers()->with('outlet')->get();
    }

    public function createBusinessReseller(array $data, string $businessPublicId, int $tenantId): \App\Models\IspReseller
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception("Business not found.");
        }

        // Verify Outlet belongs to this business
        $outletId = $data['outlet_id'] ?? null;
        if (isset($data['outlet_public_id'])) {
            $outlet = $business->outlets()->where('public_id', $data['outlet_public_id'])->first();
            if ($outlet) {
                $outletId = $outlet->id;
            }
        } elseif ($outletId) {
            $outlet = $business->outlets()->where('id', $outletId)->first();
        } else {
            $outlet = null;
        }

        if (!$outlet) {
            throw new \Exception("Outlet not found or does not belong to this business.");
        }

        // Generate Code: RES-{Timestamp}-{Random}
        $code = 'RES-' . now()->timestamp . '-' . Str::random(3);

        return DB::transaction(function () use ($tenantId, $outlet, $code, $data, $business) {
            // Create the reseller
            $reseller = $this->ispResellerRepository->create([
                'tenant_id' => $tenantId,
                'business_id' => $business->id,
                'outlet_id' => $outlet->id,
                'code' => $code,
                'name' => $data['name'],
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'is_active' => false,
                'created_at' => now(),
            ]);

            // Create installation ticket
            $description = "Instalasi baru untuk reseller: {$reseller->name}\n";
            $description .= "Kode: {$reseller->code}\n";
            $description .= "Telepon: {$reseller->phone}\n";
            if ($reseller->address) {
                $description .= "Alamat: {$reseller->address}\n";
            }
            if ($reseller->latitude && $reseller->longitude) {
                $description .= "Lokasi: {$reseller->latitude}, {$reseller->longitude}";
            }

            $this->ispMaintenanceService->createIssue($business->public_id, Auth::id() ?? 1, [
                'type' => 'installation',
                'title' => 'Instalasi Baru: ' . $reseller->name, // Add title as it is required in IspMaintenanceService
                'priority' => 'high',
                'description' => $description,
                'reseller_id' => $reseller->id,
            ]);

            return $reseller;
        });
    }

    public function updateBusinessReseller(string $businessPublicId, string $resellerCode, int $tenantId, array $data): bool
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return false;
        }

        // Verify reseller belongs to this business via outlet
        $reseller = $this->ispResellerRepository->findByCode($resellerCode, $tenantId);
        if (!$reseller) {
            return false;
        }

        // If updating outlet, verify new outlet belongs to this business
        if (isset($data['outlet_public_id'])) {
            $outlet = $business->outlets()->where('public_id', $data['outlet_public_id'])->first();
            if (!$outlet) {
                return false;
            }
            $data['outlet_id'] = $outlet->id;
            unset($data['outlet_public_id']);
        } elseif (isset($data['outlet_id'])) {
            $outlet = $business->outlets()->where('id', $data['outlet_id'])->first();
            if (!$outlet) {
                return false;
            }
        }

        return $this->ispResellerRepository->updateByCode($resellerCode, $tenantId, $data);
    }

    public function deleteBusinessReseller(string $businessPublicId, string $resellerCode, int $tenantId): bool
    {
        $business = $this->repository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return false;
        }

        return $this->ispResellerRepository->deleteByCode($resellerCode, $tenantId);
    }
}

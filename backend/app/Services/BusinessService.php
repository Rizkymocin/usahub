<?php

namespace App\Services;

use App\Repositories\BusinessRepository;
use App\Repositories\UserRepository;
use App\Repositories\TenantRepository;
use App\Repositories\AccountRepository;
use App\Repositories\IspResellerRepository;
use App\Models\Business;
use App\Models\IspResellerRegistration;
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
            ['code' => '1000', 'name' => 'Aset', 'type' => 'asset'],
            ['code' => '2000', 'name' => 'Kewajiban', 'type' => 'liability'],
            ['code' => '3000', 'name' => 'Modal', 'type' => 'equity'],
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
            // Aset (1000)
            ['code' => '1010', 'name' => 'Kas', 'type' => 'asset', 'parent' => '1000'],
            ['code' => '1020', 'name' => 'Bank', 'type' => 'asset', 'parent' => '1000'],
            ['code' => '1030', 'name' => 'Piutang', 'type' => 'asset', 'parent' => '1000'],
            ['code' => '1040', 'name' => 'Persediaan Bahan', 'type' => 'asset', 'parent' => '1000'],
            ['code' => '1050', 'name' => 'Peralatan Jaringan', 'type' => 'asset', 'parent' => '1000'],

            // Kewajiban (2000)
            ['code' => '2010', 'name' => 'Utang Voucher', 'type' => 'liability', 'parent' => '2000'],
            ['code' => '2020', 'name' => 'Hutang Komisi', 'type' => 'liability', 'parent' => '2000'],
            ['code' => '2030', 'name' => 'Pendapatan Diterima Dimuka', 'type' => 'liability', 'parent' => '2000'],

            // Modal (3000)
            ['code' => '3010', 'name' => 'Modal Pemilik', 'type' => 'equity', 'parent' => '3000'],
            ['code' => '3020', 'name' => 'Laba Ditahan', 'type' => 'equity', 'parent' => '3000'],
            ['code' => '3030', 'name' => 'Saham Pihak Ketiga', 'type' => 'equity', 'parent' => '3000'],

            // Pendapatan (4000)
            ['code' => '4010', 'name' => 'Penjualan Voucher Internet', 'type' => 'revenue', 'parent' => '4000'],

            // Beban (5000)
            ['code' => '5010', 'name' => 'Beban Maintenance Jaringan', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5020', 'name' => 'Biaya Komisi Sales', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5030', 'name' => 'Beban Jasa Teknisi', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5050', 'name' => 'Beban ATK & Operasional', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5060', 'name' => 'Beban Belanja Ditahan', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5070', 'name' => 'Pajak Perusahaan (PPh 12%)', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5080', 'name' => 'Pajak ISP (10%)', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5090', 'name' => 'Simpanan Pokok Koperasi', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5100', 'name' => 'Simpanan Wajib Koperasi', 'type' => 'expense', 'parent' => '5000'],
            ['code' => '5110', 'name' => 'Iuran Koperasi', 'type' => 'expense', 'parent' => '5000'],
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

        // Create default accounting rules
        $this->createDefaultAccountingRules($business);
    }

    private function createDefaultAccountingRules(Business $business)
    {
        // Get account IDs for this business
        $accounts = [];
        $accountCodes = ['1010', '1030', '1050', '2010', '2020', '2030', '4010', '5010', '5020'];

        foreach ($accountCodes as $code) {
            $account = \App\Models\Account::where('business_id', $business->id)
                ->where('code', $code)
                ->first();

            if ($account) {
                $accounts[$code] = $account->id;
            }
        }

        if (empty($accounts)) {
            \Log::warning("No accounts found for business {$business->id}, skipping accounting rules");
            return;
        }

        // Use the AccountingRulesSeeder logic
        $seeder = new \Database\Seeders\AccountingRulesSeeder();
        $reflection = new \ReflectionClass($seeder);
        $method = $reflection->getMethod('seedRulesForBusiness');
        $method->setAccessible(true);
        $method->invoke($seeder, $business->tenant_id, $business->id, $accounts);
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

    public function createBusinessReseller(array $data, string $businessPublicId, int $tenantId, int $salesId): \App\Models\IspReseller
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
                'is_active' => $data['is_active'] ?? true,
                'created_at' => now(),
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

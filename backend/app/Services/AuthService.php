<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\TenantService;
use App\Services\BusinessService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    protected $tenantService;
    protected $businessService;

    public function __construct(TenantService $tenantService, BusinessService $businessService)
    {
        $this->tenantService = $tenantService;
        $this->businessService = $businessService;
    }

    public function registerTenant(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Create User
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            // Assign 'owner' role
            $user->assignRole('owner');

            // 2. Create Tenant
            $tenantData = [
                'fullname' => $data['name'],
                'owner_user_id' => $user->id,
                'plans_id' => $data['plan_id'] ?? 1, // Default plan if not provided
                // public_id generated in service or model
            ];

            $tenant = $this->tenantService->createTenant($tenantData);

            // 3. Create Business
            $businessData = [
                'name' => $data['business_name'],
                'category' => $data['category'] ?? 'isp',
                'is_active' => true,
            ];
            $business = $this->businessService->createBusiness($businessData, $tenant->id);

            // 4. Create Subscription
            Subscription::create([
                'public_id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'plan_id' => $tenant->plans_id,
                'start_date' => now(),
                'status' => 'active',
            ]);

            // 5. Create Token

            // 6. Create Token
            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => $user,
                'tenant' => $tenant,
                'business' => $business,
                'roles' => $user->getRoleNames(),
                'token' => $token,
            ];
        });
    }

    public function login(array $credentials): array
    {
        $login_type = filter_var($credentials['user'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($login_type, $credentials['user'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'user' => ['Invalid credentials.'],
            ]);
        }

        // Dispatch Login event for activity logging
        event(new \Illuminate\Auth\Events\Login('web', $user, false));

        $token = $user->createToken('auth_token')->plainTextToken;
        $roles = $user->getRoleNames();

        // Find tenant if user is owner
        $tenant = Tenant::where('owner_user_id', $user->id)->first();

        // Find primary business (via tenant if owner, or direct relation)
        $business = $tenant ? $tenant->businesses()->first() : $user->businesses()->first();

        if ($business) {
            $user->business_public_id = $business->public_id;
        }

        return [
            'user' => $user,
            'tenant' => $tenant,
            'business' => $business,
            'roles' => $roles,
            'token' => $token,
        ];
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TenantResolutionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_resolves_tenant_from_subdomain(): void
    {
        $this->withoutExceptionHandling();

        // Seed dependency
        $plan = \App\Models\Plan::create([
            'public_id' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Test Plan',
            'max_business' => 1,
            'max_users' => 1,
            'price' => 0,
            'billing_cycle' => 'monthly',
        ]);

        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create a tenant
        $tenant = \App\Models\Tenant::create([
            'public_id' => 'test-tenant-uuid',
            'fullname' => 'Test Tenant',
            'owner_user_id' => $user->id,
            'plans_id' => $plan->id,
        ]);

        // Mock an API request with the subdomain
        $response = $this->withHeaders([
            'Accept' => 'application/json',
        ])->getJson('http://test-tenant-uuid.usahub.local/api/up');

        // It should resolve and continue to the health check
        $response->assertStatus(200);

        $this->assertEquals($tenant->id, app('currentTenant')->id);
    }

    public function test_it_returns_404_for_invalid_subdomain(): void
    {
        $response = $this->withHeaders([
            'Accept' => 'application/json',
        ])->getJson('http://invalid-subdomain.usahub.local/api/up');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Tenant not found or invalid subdomain.',
            ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Set team context to null to create global roles
        // Roles can still be scoped to businesses when assigned to users
        app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId(null);

        Role::create(['name' => 'superadmin']);
        Role::create(['name' => 'owner']);
        Role::create(['name' => 'business_admin']);
        Role::create(['name' => 'kasir']);
        Role::create(['name' => 'isp_outlet']);
        Role::create(['name' => 'isp_teknisi']);
    }
}

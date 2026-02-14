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

        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'owner']);
        Role::firstOrCreate(['name' => 'business_admin']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'finance']);
        Role::firstOrCreate(['name' => 'kasir']);
        Role::firstOrCreate(['name' => 'teknisi_maintenance']);
        Role::firstOrCreate(['name' => 'teknisi_pasang_baru']);
        Role::firstOrCreate(['name' => 'sales']);
    }
}

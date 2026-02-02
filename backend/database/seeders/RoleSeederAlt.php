<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeederAlt extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'superadmin', 'guard_name' => 'web', 'business_id' => null],
            ['name' => 'owner', 'guard_name' => 'web', 'business_id' => null],
            ['name' => 'business_admin', 'guard_name' => 'web', 'business_id' => null],
            ['name' => 'kasir', 'guard_name' => 'web', 'business_id' => null],
            ['name' => 'isp_outlet', 'guard_name' => 'web', 'business_id' => null],
            ['name' => 'isp_teknisi', 'guard_name' => 'web', 'business_id' => null],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insertOrIgnore(array_merge($role, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}

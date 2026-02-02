<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'sadmin@usahub.id'],
            [
                'name' => 'Super Admin',
                'email' => 'sadmin@usahub.id',
                'email_verified_at' => now(),
                'password' => Hash::make('1@Password'),
                'remember_token' => Str::random(10),
            ]
        );

        // Set team context to null for global superadmin role
        app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId(null);
        $superAdmin->assignRole('superadmin');
    }
}

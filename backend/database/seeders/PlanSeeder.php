<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'public_id'     => Str::uuid(),
                'name'          => 'Free',
                'max_business'  => 1,
                'max_users'     => 2,
                'price'         => 0,
                'billing_cycle' => 'custom',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'public_id'     => Str::uuid(),
                'name'          => 'Starter',
                'max_business'  => 3,
                'max_users'     => 5,
                'price'         => 99000,
                'billing_cycle' => 'monthly',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'public_id'     => Str::uuid(),
                'name'          => 'Growth',
                'max_business'  => 10,
                'max_users'     => 20,
                'price'         => 249000,
                'billing_cycle' => 'monthly',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('plans')->insert($plans);
    }
}

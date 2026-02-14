<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all tenants
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            // Get all businesses for this tenant
            $businesses = DB::table('businesses')
                ->where('tenant_id', $tenant->id)
                ->get();

            foreach ($businesses as $business) {
                // Check if account 2030 already exists
                $exists = DB::table('accounts')
                    ->where('business_id', $business->id)
                    ->where('code', '2030')
                    ->exists();

                if (!$exists) {
                    // Insert Unearned Revenue account
                    DB::table('accounts')->insert([
                        'public_id' => \Illuminate\Support\Str::uuid(),
                        'tenant_id' => $tenant->id,
                        'business_id' => $business->id,
                        'parent_id' => null,
                        'code' => '2030',
                        'name' => 'Pendapatan Diterima Dimuka',
                        'type' => 'liability',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove account 2030 from all businesses
        DB::table('accounts')
            ->where('code', '2030')
            ->where('name', 'Pendapatan Diterima Dimuka')
            ->delete();
    }
};

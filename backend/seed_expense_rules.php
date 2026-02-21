<?php

// Seed EVT_EXPENSE_LOGGED accounting rules
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Seeding EVT_EXPENSE_LOGGED Rules ===\n\n";

// Get all tenants
$tenants = DB::table('tenants')->get();

foreach ($tenants as $tenant) {
    echo "Processing tenant: {$tenant->id}\n";

    // Get all businesses for this tenant
    $businesses = DB::table('businesses')
        ->where('tenant_id', $tenant->id)
        ->get();

    foreach ($businesses as $business) {
        echo "  Processing business: {$business->name}\n";

        // Get account IDs
        $accountCodes = ['5010', '2010'];
        $accounts = [];

        foreach ($accountCodes as $code) {
            $account = DB::table('accounts')
                ->where('business_id', $business->id)
                ->where('code', $code)
                ->first();

            if ($account) {
                $accounts[$code] = $account->id;
            }
        }

        if (count($accounts) < 2) {
            echo "    ⚠ Missing required accounts (need 5010 and 2010), skipping\n";
            continue;
        }

        // Check for Account 2040 (Hutang Operasional), create if missing
        $acc2040 = DB::table('accounts')
            ->where('business_id', $business->id)
            ->where('code', '2040')
            ->first();

        if (!$acc2040) {
            echo "    Creating account 2040 (Hutang Operasional)...\n";
            // Find parent 2000
            $parent2000 = DB::table('accounts')->where('business_id', $business->id)->where('code', '2000')->first();

            $acc2040Id = DB::table('accounts')->insertGetId([
                'public_id' => \Illuminate\Support\Str::uuid(),
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'name' => 'Hutang Operasional',
                'type' => 'liability',
                'code' => '2040',
                'is_active' => true,
                'parent_id' => $parent2000->id ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $accounts['2040'] = $acc2040Id;
        } else {
            $accounts['2040'] = $acc2040->id;
        }

        // Check if rules already exist
        $existingRules = DB::table('accounting_rules')
            ->where('business_id', $business->id)
            ->where('event_code', 'EVT_EXPENSE_LOGGED')
            ->first();

        if ($existingRules) {
            // Update existing rule to point to 2040 if it uses 2010
            if ($existingRules->account_id == $accounts['2010'] && $existingRules->direction == 'CREDIT') {
                DB::table('accounting_rules')
                    ->where('id', $existingRules->id)
                    ->update(['account_id' => $accounts['2040'], 'updated_at' => now()]);
                echo "    ✓ Updated existing rule to use Account 2040\n";
            } else {
                // Check the second rule (CREDIT one)
                DB::table('accounting_rules')
                    ->where('business_id', $business->id)
                    ->where('event_code', 'EVT_EXPENSE_LOGGED')
                    ->where('direction', 'CREDIT')
                    ->update(['account_id' => $accounts['2040'], 'updated_at' => now()]);
                echo "    ✓ Updated existing CREDIT rule to use Account 2040\n";
            }
            continue;
        }

        // Create rules
        $rules = [
            // Debit Biaya Pemeliharaan
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_EXPENSE_LOGGED',
                'rule_name' => 'Expense logged - maintenance cost (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5010'], // Biaya Pemeliharaan
                'direction' => 'DEBIT',
                'amount_source' => 'expense_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Credit Hutang Operasional
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_EXPENSE_LOGGED',
                'rule_name' => 'Expense logged - reimbursement liability (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['2040'], // Hutang Operasional
                'direction' => 'CREDIT',
                'amount_source' => 'expense_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('accounting_rules')->insert($rules);
        echo "    ✓ Created " . count($rules) . " EVT_EXPENSE_LOGGED rules using Account 2040\n";
    }
}

echo "\n✅ EVT_EXPENSE_LOGGED rules seeded successfully!\n";

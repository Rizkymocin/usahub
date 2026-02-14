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

        // Check if rules already exist
        $existingRules = DB::table('accounting_rules')
            ->where('business_id', $business->id)
            ->where('event_code', 'EVT_EXPENSE_LOGGED')
            ->count();

        if ($existingRules > 0) {
            echo "    ✓ EVT_EXPENSE_LOGGED rules already exist ({$existingRules} rules)\n";
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
            // Credit Hutang Reimburse
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_EXPENSE_LOGGED',
                'rule_name' => 'Expense logged - reimbursement liability (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['2010'], // Hutang Reimburse
                'direction' => 'CREDIT',
                'amount_source' => 'expense_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('accounting_rules')->insert($rules);
        echo "    ✓ Created " . count($rules) . " EVT_EXPENSE_LOGGED rules\n";
    }
}

echo "\n✅ EVT_EXPENSE_LOGGED rules seeded successfully!\n";

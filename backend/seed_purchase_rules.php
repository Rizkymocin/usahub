<?php

// Seed EVT_PURCHASE rules (Inventory & Credit)
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

echo "=== Seeding EVT_PURCHASE Rules (Inventory & Credit) ===\n\n";

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
        $accountCodes = ['1010', '1040', '2010', '2040', '5010'];
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

        // Check/Create Account 1040 (Persediaan Bahan)
        if (!isset($accounts['1040'])) {
            echo "    Creating account 1040 (Persediaan Bahan)...\n";
            $parent1000 = DB::table('accounts')->where('business_id', $business->id)->where('code', '1000')->first();

            $acc1040Id = DB::table('accounts')->insertGetId([
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'name' => 'Persediaan Bahan',
                'type' => 'asset',
                'code' => '1040',
                'is_active' => true,
                'parent_id' => $parent1000->id ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $accounts['1040'] = $acc1040Id;
        }

        // Check/Create Account 2040 (Hutang Operasional)
        if (!isset($accounts['2040'])) {
            echo "    Creating account 2040 (Hutang Operasional)...\n";
            $parent2000 = DB::table('accounts')->where('business_id', $business->id)->where('code', '2000')->first();

            $acc2040Id = DB::table('accounts')->insertGetId([
                'public_id' => (string) Str::uuid(),
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
        }

        // Prepare Rules to Insert/Update
        $rulesToSync = [
            // EVT_PURCHASE_PAID - Inventory (2 rules)
            [
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase inventory paid (debit)',
                'priority' => 5,
                'condition_json' => json_encode(['purchase_category' => 'inventory']),
                'account_id' => $accounts['1040'],
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],
            [
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase inventory paid (credit)',
                'priority' => 6,
                'condition_json' => json_encode(['purchase_category' => 'inventory']),
                'account_id' => $accounts['1010'] ?? null, // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],

            // EVT_PURCHASE_ON_CREDIT - Expense (2 rules)
            [
                'event_code' => 'EVT_PURCHASE_ON_CREDIT',
                'rule_name' => 'Purchase expense on credit (debit)',
                'priority' => 1,
                'condition_json' => json_encode(['purchase_category' => 'expense']),
                'account_id' => $accounts['5010'] ?? null, // Beban Maintenance
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],
            [
                'event_code' => 'EVT_PURCHASE_ON_CREDIT',
                'rule_name' => 'Purchase expense on credit (credit)',
                'priority' => 2,
                'condition_json' => json_encode(['purchase_category' => 'expense']),
                'account_id' => $accounts['2040'] ?? $accounts['2010'] ?? null,
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],

            // EVT_PURCHASE_ON_CREDIT - Inventory (2 rules)
            [
                'event_code' => 'EVT_PURCHASE_ON_CREDIT',
                'rule_name' => 'Purchase inventory on credit (debit)',
                'priority' => 3,
                'condition_json' => json_encode(['purchase_category' => 'inventory']),
                'account_id' => $accounts['1040'],
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],
            [
                'event_code' => 'EVT_PURCHASE_ON_CREDIT',
                'rule_name' => 'Purchase inventory on credit (credit)',
                'priority' => 4,
                'condition_json' => json_encode(['purchase_category' => 'inventory']),
                'account_id' => $accounts['2040'] ?? $accounts['2010'] ?? null,
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],

            // EVT_PURCHASE_PAID - Expense (2 rules) - MISSING IN PREVIOUS RUN
            [
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase expense paid (debit)',
                'priority' => 1,
                'condition_json' => json_encode(['purchase_category' => 'expense']),
                'account_id' => $accounts['5010'] ?? null, // Beban Maintenance
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],
            [
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase expense paid (credit)',
                'priority' => 2,
                'condition_json' => json_encode(['purchase_category' => 'expense']),
                'account_id' => $accounts['1010'] ?? null, // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
            ],
        ];

        foreach ($rulesToSync as $ruleData) {
            if (empty($ruleData['account_id'])) {
                echo "    ⚠ Skipping rule {$ruleData['rule_name']} - missing account\n";
                continue;
            }

            // Check if rule exists
            $exists = DB::table('accounting_rules')
                ->where('business_id', $business->id)
                ->where('event_code', $ruleData['event_code'])
                ->where('rule_name', $ruleData['rule_name'])
                ->first();

            if ($exists) {
                // Update account_id if different
                if ($exists->account_id != $ruleData['account_id']) {
                    DB::table('accounting_rules')
                        ->where('id', $exists->id)
                        ->update(['account_id' => $ruleData['account_id'], 'updated_at' => now()]);
                    echo "    ✓ Updated {$ruleData['rule_name']}\n";
                }
            } else {
                // Insert
                DB::table('accounting_rules')->insert(array_merge($ruleData, [
                    'tenant_id' => $tenant->id,
                    'business_id' => $business->id,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
                echo "    ✓ Created {$ruleData['rule_name']}\n";
            }
        }
    }
}

echo "\n✅ EVT_PURCHASE rules seeded successfully!\n";

<?php

// Manual seeder for accounting rules
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Seeding Accounting Rules ===\n\n";

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
        $accountCodes = ['1010', '1030', '1050', '2010', '4010', '5010'];
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

        if (empty($accounts)) {
            echo "    ⚠ No accounts found, skipping\n";
            continue;
        }

        // Check if rules already exist
        $existingRules = DB::table('accounting_rules')
            ->where('business_id', $business->id)
            ->where('event_code', 'EVT_VOUCHER_SOLD')
            ->count();

        if ($existingRules > 0) {
            echo "    ✓ EVT_VOUCHER_SOLD rules already exist ({$existingRules} rules)\n";
            continue;
        }

        // Create rules
        $rules = [
            // Cash payment
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - cash (debit)',
                'priority' => 1,
                'condition_json' => json_encode(['payment_type' => 'cash']),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode(['payment_type' => 'cash']),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Credit payment
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - credit (debit)',
                'priority' => 3,
                'condition_json' => json_encode(['payment_type' => 'credit']),
                'account_id' => $accounts['1030'], // Piutang
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - credit (credit)',
                'priority' => 4,
                'condition_json' => json_encode(['payment_type' => 'credit']),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Partial payment - cash portion
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - partial cash (debit)',
                'priority' => 5,
                'condition_json' => json_encode(['payment_type' => 'partial']),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'cash_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Partial payment - credit portion
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - partial credit (debit)',
                'priority' => 6,
                'condition_json' => json_encode(['payment_type' => 'partial']),
                'account_id' => $accounts['1030'], // Piutang
                'direction' => 'DEBIT',
                'amount_source' => 'credit_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Partial payment - revenue
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - partial (credit)',
                'priority' => 7,
                'condition_json' => json_encode(['payment_type' => 'partial']),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('accounting_rules')->insert($rules);
        echo "    ✓ Created " . count($rules) . " EVT_VOUCHER_SOLD rules\n";
    }
}

echo "\n✅ Accounting rules seeded successfully!\n";

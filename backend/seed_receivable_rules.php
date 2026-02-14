<?php

// Seed EVT_RECEIVABLE_COLLECTED accounting rules
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Seeding EVT_RECEIVABLE_COLLECTED Rules ===\n\n";

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
        $accountCodes = ['1010', '1030'];
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
            echo "    ⚠ Missing required accounts (need 1010 and 1030), skipping\n";
            continue;
        }

        // Check if rules already exist
        $existingRules = DB::table('accounting_rules')
            ->where('business_id', $business->id)
            ->where('event_code', 'EVT_RECEIVABLE_COLLECTED')
            ->count();

        if ($existingRules > 0) {
            echo "    ✓ EVT_RECEIVABLE_COLLECTED rules already exist ({$existingRules} rules)\n";
            continue;
        }

        // Create rules
        $rules = [
            // Debit Kas
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_RECEIVABLE_COLLECTED',
                'rule_name' => 'Receivable collected (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'paid_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Credit Piutang
            [
                'tenant_id' => $tenant->id,
                'business_id' => $business->id,
                'event_code' => 'EVT_RECEIVABLE_COLLECTED',
                'rule_name' => 'Receivable collected (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1030'], // Piutang
                'direction' => 'CREDIT',
                'amount_source' => 'paid_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('accounting_rules')->insert($rules);
        echo "    ✓ Created " . count($rules) . " EVT_RECEIVABLE_COLLECTED rules\n";
    }
}

echo "\n✅ EVT_RECEIVABLE_COLLECTED rules seeded successfully!\n";

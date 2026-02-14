<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Business;
use App\Models\Account;
use App\Models\AccountingRule;
use Illuminate\Support\Facades\DB;

echo "Seeding EVT_REGISTRATION_APPROVED accounting rules...\n\n";

$businesses = Business::all();

foreach ($businesses as $business) {
    echo "Processing business: {$business->name} (ID: {$business->id})\n";

    // Check if accounts exist
    $expenseAccount = Account::where('business_id', $business->id)
        ->where('code', '5020')
        ->first();

    $payableAccount = Account::where('business_id', $business->id)
        ->where('code', '2020')
        ->first();

    if (!$expenseAccount) {
        echo "  ⚠️  Account 5020 (Biaya Komisi Sales) not found. Creating...\n";
        $expenseAccount = Account::create([
            'tenant_id' => $business->tenant_id,
            'business_id' => $business->id,
            'code' => '5020',
            'name' => 'Biaya Komisi Sales',
            'type' => 'expense',
            'is_active' => true,
        ]);
    }

    if (!$payableAccount) {
        echo "  ⚠️  Account 2020 (Hutang Komisi) not found. Creating...\n";
        $payableAccount = Account::create([
            'tenant_id' => $business->tenant_id,
            'business_id' => $business->id,
            'code' => '2020',
            'name' => 'Hutang Komisi',
            'type' => 'liability',
            'is_active' => true,
        ]);
    }

    // Check if rules already exist
    $existingRules = AccountingRule::where('business_id', $business->id)
        ->where('event_code', 'EVT_REGISTRATION_APPROVED')
        ->count();

    if ($existingRules > 0) {
        echo "  ℹ️  Rules already exist. Skipping...\n";
        continue;
    }

    // Create accounting rules
    DB::transaction(function () use ($business, $expenseAccount, $payableAccount) {
        // Rule 1: Debit Biaya Komisi Sales
        AccountingRule::create([
            'tenant_id' => $business->tenant_id,
            'business_id' => $business->id,
            'event_code' => 'EVT_REGISTRATION_APPROVED',
            'account_id' => $expenseAccount->id,
            'direction' => 'DEBIT',
            'amount_source' => 'commission_amount',
            'priority' => 1,
            'is_active' => true,
            'conditions_json' => null,
        ]);

        // Rule 2: Credit Hutang Komisi
        AccountingRule::create([
            'tenant_id' => $business->tenant_id,
            'business_id' => $business->id,
            'event_code' => 'EVT_REGISTRATION_APPROVED',
            'account_id' => $payableAccount->id,
            'direction' => 'CREDIT',
            'amount_source' => 'commission_amount',
            'priority' => 2,
            'is_active' => true,
            'conditions_json' => null,
        ]);
    });

    echo "  ✅ Created 2 accounting rules for EVT_REGISTRATION_APPROVED\n";
}

echo "\n✅ Seeding completed!\n";
echo "Total businesses processed: " . $businesses->count() . "\n";

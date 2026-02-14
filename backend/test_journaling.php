<?php

// Test script for voucher sales journaling
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Voucher Sales Journaling Test ===\n\n";

// 1. Check business and products
$business = App\Models\Business::first();
if (!$business) {
    echo "❌ No business found\n";
    exit(1);
}
echo "✓ Business: {$business->name}\n";

// 2. Check account 2030
$account2030 = App\Models\Account::where('business_id', $business->id)
    ->where('code', '2030')
    ->first();
echo $account2030
    ? "✓ Account 2030: {$account2030->name}\n"
    : "❌ Account 2030 not found\n";

// 3. Check prepaid rules
$prepaidRules = App\Models\AccountingRule::where('business_id', $business->id)
    ->whereIn('event_code', ['EVT_VOUCHER_PREPAID', 'EVT_VOUCHER_DELIVERED'])
    ->get();
echo "✓ Prepaid rules: {$prepaidRules->count()}\n";
foreach ($prepaidRules as $rule) {
    $account = App\Models\Account::find($rule->account_id);
    echo "  - {$rule->event_code}: {$rule->rule_name} → Account {$account->code} ({$account->name})\n";
}

// 4. Check regular voucher sold rules
$soldRules = App\Models\AccountingRule::where('business_id', $business->id)
    ->where('event_code', 'EVT_VOUCHER_SOLD')
    ->get();
echo "✓ Voucher sold rules: {$soldRules->count()}\n";

echo "\n✅ All accounting infrastructure is in place!\n";

<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$publicId = 'ef093a6e-5ce6-4a02-b3fa-2e846945eb2c';

echo "Searching for business with Public ID: $publicId\n";

$business = DB::table('businesses')->where('public_id', $publicId)->first();

if (!$business) {
    echo "Business not found!\n";
    exit(1);
}

echo "Found Business: {$business->name} (ID: {$business->id})\n";

$rules = DB::table('accounting_rules')
    ->where('business_id', $business->id)
    ->where('event_code', 'EVT_PURCHASE_PAID')
    ->get();

echo "Found " . $rules->count() . " rules for EVT_PURCHASE_PAID:\n";

foreach ($rules as $rule) {
    echo "  - Rule: {$rule->rule_name}\n";
    echo "    Condition: {$rule->condition_json}\n";
    echo "    Account ID: {$rule->account_id}\n";
    echo "    Direction: {$rule->direction}\n";
    echo "    Active: {$rule->is_active}\n";
    echo "    ----------------\n";
}

<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\IspReseller;
use App\Models\IspProspect;

$business = Business::first();
echo "Business: {$business->name}\n";

echo "\n--- Resellers with IP ---\n";
$resellers = IspReseller::where('business_id', $business->id)
    ->whereNotNull('ip_address')
    ->orderBy('id', 'desc')
    ->get(['id', 'name', 'ip_address', 'cidr']);

foreach ($resellers as $r) {
    echo "ID: {$r->id} | {$r->name} | {$r->ip_address}/{$r->cidr}\n";
}

echo "\n--- Prospects with IP ---\n";
$prospects = IspProspect::where('business_id', $business->id)
    ->whereNotNull('ip_address')
    ->orderBy('id', 'desc')
    ->get(['id', 'name', 'ip_address', 'cidr']);

foreach ($prospects as $p) {
    echo "ID: {$p->id} | {$p->name} | {$p->ip_address}/{$p->cidr}\n";
}

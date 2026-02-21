<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\BusinessService;
use App\Models\Business;
use App\Models\User;
use Illuminate\Support\Str;

// Helper to get a test business
$business = Business::first();
if (!$business) {
    die("No business found. Seed data first.\n");
}
echo "Using Business: {$business->name}\n";

// Helper to get a user (admin/sales)
$user = User::first();
if (!$user) {
    die("No user found.\n");
}

$service = app(BusinessService::class);
$outlet = $business->outlets()->first();

if (!$outlet) {
    die("No outlet found.\n");
}

// Data with IP
$data = [
    'outlet_public_id' => $outlet->public_id,
    'name' => 'Manual IP Reseller ' . time(),
    'phone' => '08999' . time(),
    'address' => 'Manual IP Address',
    'ip_address' => '10.20.30.40',
    'cidr' => 29
];

echo "\n--- Creating Reseller with Manual IP ---\n";
try {
    $reseller = $service->createBusinessReseller($data, $business->public_id, $business->tenant_id, $user->id);
    echo "Reseller Created: {$reseller->name}, Code: {$reseller->code}\n";
    echo "IP: {$reseller->ip_address} / {$reseller->cidr}\n";

    if ($reseller->ip_address === '10.20.30.40' && $reseller->cidr == 29) {
        echo "[SUCCESS] Manual IP Assigned Correctly.\n";
    } else {
        echo "[FAILED] Manual IP Mismatch.\n";
    }
} catch (Exception $e) {
    echo "[ERROR] " . $e->getMessage() . "\n";
}

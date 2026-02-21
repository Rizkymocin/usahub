<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\User;
use App\Models\IspReseller;
use App\Models\IspProspect;
use App\Services\IspProspectService;

// Setup Data
$business = Business::first();
$user = User::first();
$service = app(IspProspectService::class);

echo "Using Business: {$business->name}\n";

// 1. Get an existing reseller to act as Uplink
$uplinkReseller = IspReseller::where('business_id', $business->id)->first();
if (!$uplinkReseller) {
    die("No reseller found to use as uplink.\n");
}
echo "Uplink Reseller: {$uplinkReseller->name} (ID: {$uplinkReseller->id})\n";

// 2. Register a new prospect
$prospectData = [
    'name' => 'Uplink Test Prospect ' . time(),
    'phone' => '08123456789',
    'address' => 'Test Address',
    'outlet_public_id' => $business->outlets()->first()->public_id
];
$prospect = $service->register($business, $prospectData, $user->id);
echo "Registered Prospect: {$prospect->name} (ID: {$prospect->id})\n";

// 3. Approve Prospect with Uplink Reseller
echo "\n--- Approving with Uplink ID: {$uplinkReseller->id} ---\n";
try {
    $prospect = $service->approve($prospect->public_id, $user->id, 'Approved with Uplink', 0, $uplinkReseller->id);

    // Verify Uplink in Prospect
    echo "Expected Uplink ID: {$uplinkReseller->id}\n";
    echo "Actual Uplink ID: {$prospect->uplink_reseller_id}\n";

    if ($prospect->uplink_reseller_id == $uplinkReseller->id) {
        echo "[SUCCESS] Prospect Uplink ID matches.\n";
    } else {
        echo "[FAILED] Prospect Uplink ID mismatch.\n";
    }

    // Verify Ticket Description
    $ticket = $prospect->maintenanceIssue;
    if ($ticket && str_contains($ticket->description, "Uplink Reseller: {$uplinkReseller->name}")) {
        echo "[SUCCESS] Ticket description contains Uplink info.\n";
    } else {
        echo "[FAILED] Ticket description missing Uplink info.\n";
        echo "Description: " . ($ticket ? $ticket->description : 'No Ticket') . "\n";
    }

    // 4. Activate Prospect (simulate full flow)
    $service->markInstalled($prospect);
    $service->activate($prospect->public_id, $user->id);

    // Refresh to find the new reseller
    $newReseller = IspReseller::where('business_id', $business->id)
        ->where('name', $prospectData['name'])
        ->first();

    if ($newReseller && $newReseller->uplink_reseller_id == $uplinkReseller->id) {
        echo "[SUCCESS] New Reseller Uplink ID matches.\n";
    } else {
        echo "[FAILED] New Reseller Uplink ID mismatch.\n";
    }
} catch (Exception $e) {
    echo "[ERROR] " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

// Cleanup
echo "\n--- Cleaning Up ---\n";
if (isset($newReseller)) $newReseller->delete();
if (isset($prospect)) $prospect->delete();

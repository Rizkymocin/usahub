<?php

use App\Models\Business;
use App\Models\IspReseller;
use App\Models\IspMaintenanceIssue;
use App\Services\IspMaintenanceService;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel if needed, but we'll run this via tinker
// This is a template for what to run in tinker

$business = Business::first();
if (!$business) {
    echo "No business found\n";
    exit;
}

$reseller = IspReseller::create([
    'tenant_id' => $business->tenant_id,
    'business_id' => $business->id,
    'outlet_id' => $business->outlets()->first()->id,
    'code' => 'TEST-R-' . mt_rand(1000, 9999),
    'name' => 'Test Reseller Activation',
    'phone' => '08123456789',
    'is_active' => false,
]);

echo "Created Inactive Reseller ID: {$reseller->id}\n";

$service = app(IspMaintenanceService::class);
$issue = $service->createIssue($business->public_id, 1, [
    'reseller_id' => $reseller->id,
    'title' => 'Test Installation Ticket',
    'priority' => 'high',
    'type' => 'installation',
]);

echo "Created Installation Ticket ID: {$issue->id}, Type: {$issue->type}, Status: {$issue->status}\n";

// Simulate resolving via logActivity
$service->logActivity($business->public_id, $issue->public_id, 1, [
    'action_taken' => 'Testing success result',
    'result' => 'success',
    'notes' => 'Should activate reseller',
]);

$reseller->refresh();
echo "Reseller is_active after success log: " . ($reseller->is_active ? 'TRUE' : 'FALSE') . "\n";

if ($reseller->is_active === true) {
    echo "VERIFICATION SUCCESSFUL\n";
} else {
    echo "VERIFICATION FAILED\n";
}

// Cleanup
$issue->logs()->delete();
$issue->delete();
$reseller->delete();

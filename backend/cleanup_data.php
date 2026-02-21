<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\IspProspect;
use App\Models\IspReseller;

echo "--- Deleting Test Data ---\n";

// Delete Prospects with "Test Prospect" in name
$prospects = IspProspect::where('name', 'like', 'Test Prospect%')->get();
foreach ($prospects as $p) {
    echo "Deleting Prospect: {$p->name} ({$p->ip_address})\n";
    $p->delete();
}

// Delete Resellers with "Manual IP" in name
$resellers = IspReseller::where('name', 'like', 'Manual IP%')->get();
foreach ($resellers as $r) {
    echo "Deleting Reseller: {$r->name} ({$r->ip_address})\n";
    $r->delete();
}

// Also check for the specific outlier mentioned by user if possible, or just list remaining
echo "\n--- Remaining High IPs (>= 192.168.100.0) ---\n";
// ip2long(192.168.100.0) = 3232261120
// But we can't query by ip2long easily on string column.
// Just simple like
$highIps = IspProspect::where('ip_address', 'like', '192.168.100.%')
    ->orWhere('ip_address', 'like', '192.168.101.%')
    ->orWhere('ip_address', 'like', '192.168.102.%')
    ->orWhere('ip_address', 'like', '192.168.103.%')
    ->get();

foreach ($highIps as $p) {
    echo "WARNING: Remaining High IP Prospect: {$p->name} - {$p->ip_address}\n";
}

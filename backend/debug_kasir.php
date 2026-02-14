<?php

use App\Models\User;
use App\Models\Business;
use App\Repositories\IspVoucherStockRepository;

// 1. Find the Kasir user (assuming Email 'andre@mail.com' from previous output, or find any user with role 'kasir')
// Actually better to just check the first user connected to Business 1 if any.
$businessId = 1;
$business = Business::find($businessId);

echo "Checking Business: {$business->name} ({$business->public_id})\n";

// Check stocks count again
$repo = new IspVoucherStockRepository();
try {
    $summary = $repo->getStockSummary($businessId);
    echo "Summary Count: " . $summary->count() . "\n";
    echo "Summary Data: " . $summary->toJson(JSON_PRETTY_PRINT) . "\n";
} catch (\Exception $e) {
    echo "Error fetching summary: " . $e->getMessage() . "\n";
}

// Check Users associated
$users = $business->users;
echo "Associated Users:\n";
foreach ($users as $u) {
    echo "- {$u->name} ({$u->email}) - Roles: " . implode(', ', $u->getRoleNames()->toArray()) . "\n";
}

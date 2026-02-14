<?php

use App\Models\Business;
use App\Models\IspVoucherStock;
use App\Models\User;

$users = User::select('id', 'name', 'email')->get();
$businesses = Business::select('id', 'public_id', 'name')->get();

echo "Users:\n";
foreach ($users as $u) {
    echo "- User: {$u->name} (ID: {$u->id}, Email: {$u->email})\n";
}

echo "\nBusinesses:\n";
foreach ($businesses as $b) {
    $stockCount = IspVoucherStock::where('business_id', $b->id)->sum('quantity');
    echo "- Business: {$b->name} (ID: {$b->id}, Public ID: {$b->public_id})\n";
    echo "  Total Stock Quantity: {$stockCount}\n";

    // Detailed stock
    $stocks = IspVoucherStock::where('business_id', $b->id)->get();
    foreach ($stocks as $s) {
        $productName = $s->voucherProduct ? $s->voucherProduct->name : 'Unknown Product (ID: ' . $s->voucher_product_id . ')';
        echo "  - {$productName}: Qty {$s->quantity}, Price {$s->default_selling_price}\n";
    }
}

<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Setting team context to null...\n";
    app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId(null);

    echo "Creating superadmin role...\n";
    $role = \Spatie\Permission\Models\Role::create(['name' => 'superadmin']);

    echo "Success! Role created with ID: " . $role->id . "\n";
    echo "business_id: " . ($role->business_id ?? 'null') . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

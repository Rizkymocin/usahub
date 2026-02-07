<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing check constraint
        DB::statement("ALTER TABLE isp_maintenance_issues DROP CONSTRAINT IF EXISTS isp_maintenance_issues_type_check");

        // Add the new constraint including 'installation'
        DB::statement("ALTER TABLE isp_maintenance_issues ADD CONSTRAINT isp_maintenance_issues_type_check CHECK (type::text IN ('infra', 'cpe', 'installation', 'other'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original constraint
        DB::statement("ALTER TABLE isp_maintenance_issues DROP CONSTRAINT IF EXISTS isp_maintenance_issues_type_check");
        DB::statement("ALTER TABLE isp_maintenance_issues ADD CONSTRAINT isp_maintenance_issues_type_check CHECK (type::text IN ('infra', 'cpe', 'other'))");
    }
};

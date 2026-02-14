<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: Drop and recreate the constraint with new values
        DB::statement("ALTER TABLE voucher_sales DROP CONSTRAINT IF EXISTS voucher_sales_status_check");
        DB::statement("ALTER TABLE voucher_sales ADD CONSTRAINT voucher_sales_status_check CHECK (status IN ('pending', 'completed', 'cancelled', 'reserved', 'partial_debt', 'full_debt'))");
    }

    public function down(): void
    {
        // Revert to original constraint
        DB::statement("ALTER TABLE voucher_sales DROP CONSTRAINT IF EXISTS voucher_sales_status_check");
        DB::statement("ALTER TABLE voucher_sales ADD CONSTRAINT voucher_sales_status_check CHECK (status IN ('pending', 'completed', 'cancelled'))");
    }
};

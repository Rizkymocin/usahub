<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('voucher_stock_allocations', function (Blueprint $table) {
            $table->integer('qty_damaged')->default(0)->after('qty_sold');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_stock_allocations', function (Blueprint $table) {
            $table->dropColumn('qty_damaged');
        });
    }
};

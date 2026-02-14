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
        Schema::table('isp_purchases', function (Blueprint $table) {
            $table->string('invoice_number')->nullable()->after('supplier_name');
        });

        Schema::table('isp_purchase_items', function (Blueprint $table) {
            $table->string('unit')->default('pcs')->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('isp_purchase_items', function (Blueprint $table) {
            $table->dropColumn('unit');
        });

        Schema::table('isp_purchases', function (Blueprint $table) {
            $table->dropColumn('invoice_number');
        });
    }
};

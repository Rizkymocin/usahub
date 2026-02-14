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
        Schema::table('voucher_sales', function (Blueprint $table) {
            $table->timestamp('delivered_at')->nullable();
            $table->boolean('is_prepaid')->default(false);
            $table->text('delivery_note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('isp_voucher_sales', function (Blueprint $table) {
            $table->dropColumn(['delivered_at', 'is_prepaid', 'delivery_note']);
        });
    }
};

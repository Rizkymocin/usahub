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
            $table->enum('payment_method', ['cash', 'partial', 'credit'])->default('cash')->after('total_amount');
            $table->decimal('paid_amount', 15, 2)->default(0)->after('payment_method');
            $table->decimal('remaining_amount', 15, 2)->default(0)->after('paid_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_sales', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'paid_amount', 'remaining_amount']);
        });
    }
};

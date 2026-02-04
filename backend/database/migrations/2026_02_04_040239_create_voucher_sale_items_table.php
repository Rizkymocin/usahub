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
        Schema::create('voucher_sale_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('voucher_sale_id')
                ->constrained('voucher_sales')
                ->cascadeOnDelete();

            $table->foreignId('voucher_product_id')
                ->constrained('isp_voucher_products')
                ->cascadeOnDelete();

            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);

            $table->timestamps();

            // Index for faster queries
            $table->index('voucher_sale_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_sale_items');
    }
};

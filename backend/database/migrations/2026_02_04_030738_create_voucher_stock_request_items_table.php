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
        Schema::create('voucher_stock_request_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('stock_request_id')
                ->constrained('voucher_stock_requests')
                ->cascadeOnDelete();

            $table->foreignId('voucher_product_id')
                ->constrained('isp_voucher_products')
                ->cascadeOnDelete();

            $table->integer('qty');

            // Snapshot harga saat request
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_stock_request_items');
    }
};

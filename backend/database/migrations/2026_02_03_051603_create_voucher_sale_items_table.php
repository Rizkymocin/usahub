<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voucher_sale_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sale_id')
                ->constrained('voucher_sales')
                ->cascadeOnDelete();

            $table->foreignId('voucher_product_id')
                ->constrained('isp_voucher_products')
                ->cascadeOnDelete();

            $table->unsignedInteger('qty');

            // snapshot harga & pembagian saat transaksi
            $table->decimal('selling_price', 15, 2);
            $table->decimal('owner_share', 15, 2);
            $table->decimal('reseller_fee', 15, 2);

            $table->timestamps();

            $table->index(['sale_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_sale_items');
    }
};

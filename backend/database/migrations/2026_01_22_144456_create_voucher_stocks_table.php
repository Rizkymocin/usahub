<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('isp_voucher_stocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('voucher_product_id')
                ->constrained('isp_voucher_products')
                ->cascadeOnDelete();

            $table->unsignedInteger('qty_available')->default(0);

            $table->timestamps();

            // 1 business hanya punya 1 stok per produk voucher
            $table->unique(['business_id', 'voucher_product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_voucher_stocks');
    }
};

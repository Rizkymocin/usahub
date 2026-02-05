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
        Schema::create('voucher_pricing', function (Blueprint $table) {
            $table->id();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('voucher_product_id')
                ->constrained('isp_voucher_products')
                ->cascadeOnDelete();

            $table->enum('channel_type', ['reseller', 'outlet', 'end_user']);
            $table->decimal('price', 15, 2);

            $table->timestamps();

            // Unique constraint: one price per product per channel
            $table->unique(['business_id', 'voucher_product_id', 'channel_type'], 'unique_pricing_per_channel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_pricing');
    }
};

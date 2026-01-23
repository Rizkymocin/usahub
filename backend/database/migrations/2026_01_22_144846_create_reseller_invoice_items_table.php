<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reseller_invoice_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')
                ->references('id')
                ->on('reseller_invoices')
                ->onDelete('cascade');

            $table->foreignId('voucher_product_id')
                ->references('id')
                ->on('isp_voucher_products')
                ->onDelete('restrict');

            $table->integer('qty');
            $table->unsignedBigInteger('amount');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reseller_invoice_items');
    }
};

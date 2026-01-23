<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('transaction_id')
                ->references('id')
                ->on('pos_transactions')
                ->onDelete('cascade');

            $table->foreignId('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('restrict');

            $table->unsignedInteger('qty');
            $table->unsignedBigInteger('selling_price');
            $table->unsignedBigInteger('subtotal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};

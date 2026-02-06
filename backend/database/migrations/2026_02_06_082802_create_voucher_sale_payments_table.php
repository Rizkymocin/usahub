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
        Schema::create('voucher_sale_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('voucher_sale_id')
                ->constrained('voucher_sales')
                ->cascadeOnDelete();

            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->default('cash'); // cash, transfer
            $table->text('note')->nullable();

            $table->foreignId('collected_by_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamp('paid_at');
            $table->timestamps();

            // Index for faster queries
            $table->index(['voucher_sale_id', 'paid_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_sale_payments');
    }
};

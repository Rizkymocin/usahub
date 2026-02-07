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
        Schema::create('isp_voucher_stock_adjustments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('voucher_product_id')
                ->constrained('isp_voucher_products')
                ->cascadeOnDelete();

            // Quantity adjusted. Negative for damage/loss, Positive for correction/found
            $table->integer('quantity');

            // Type of adjustment
            $table->enum('adjustment_type', ['damage', 'loss', 'expired', 'correction', 'other']);

            // Where the adjustment happened
            $table->enum('source_type', ['warehouse', 'allocation']);

            // ID of isp_voucher_stocks or voucher_stock_allocations depending on source_type
            $table->unsignedBigInteger('source_id')->nullable();

            $table->text('notes')->nullable();
            $table->string('attachment_path')->nullable(); // For photos of damaged vouchers

            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            // Indexes
            $table->index(['business_id', 'source_type', 'source_id']);
            $table->index(['business_id', 'adjustment_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('isp_voucher_stock_adjustments');
    }
};

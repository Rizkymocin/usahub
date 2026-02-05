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
        Schema::create('voucher_stock_allocations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            // Finance user who receives the allocation
            $table->foreignId('allocated_to_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('voucher_product_id')
                ->constrained('isp_voucher_products')
                ->cascadeOnDelete();

            $table->integer('qty_allocated');
            $table->integer('qty_sold')->default(0);

            // Source of allocation: 'request' (from stock request) or 'manual' (admin created)
            $table->enum('source_type', ['request', 'manual']);

            // Reference to voucher_stock_request_id if source_type = 'request'
            $table->foreignId('source_id')
                ->nullable()
                ->constrained('voucher_stock_requests')
                ->nullOnDelete();

            $table->enum('status', ['active', 'closed'])->default('active');

            $table->timestamp('allocated_at');

            // Admin who created/approved the allocation
            $table->foreignId('allocated_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('closed_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index('allocated_to_user_id');
            $table->index('voucher_product_id');
            $table->index('status');
            $table->index(['allocated_to_user_id', 'voucher_product_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_stock_allocations');
    }
};

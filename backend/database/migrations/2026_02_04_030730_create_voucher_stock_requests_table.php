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
        Schema::create('voucher_stock_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            // User yang melakukan request (Finance role)
            $table->foreignId('requested_by_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Optional: jika request untuk outlet tertentu
            $table->foreignId('outlet_id')
                ->nullable()
                ->constrained('isp_outlets')
                ->nullOnDelete();

            $table->decimal('total_amount', 15, 2);

            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending');

            $table->timestamp('requested_at')->nullable();
            $table->timestamp('processed_at')->nullable();

            // User yang approve/reject (Admin role)
            $table->foreignId('processed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('request_note')->nullable();
            $table->text('process_note')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_stock_requests');
    }
};

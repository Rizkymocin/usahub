<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voucher_sales', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();

            $table->foreignId('tenant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            // channel penjualan: outlet, reseller, atau admin
            $table->enum('channel_type', ['outlet', 'reseller', 'admin']);

            $table->foreignId('outlet_id')
                ->nullable()
                ->constrained('isp_outlets')
                ->cascadeOnDelete();

            $table->foreignId('reseller_id')
                ->nullable()
                ->constrained('isp_resellers')
                ->cascadeOnDelete();

            // user yang melakukan penjualan
            $table->foreignId('sold_by_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // total transaksi
            $table->decimal('total_amount', 15, 2);

            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->timestamp('sold_at');

            $table->timestamps();

            // index biar laporan kencang
            $table->index(['business_id', 'channel_type']);
            $table->index(['sold_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_sales');
    }
};

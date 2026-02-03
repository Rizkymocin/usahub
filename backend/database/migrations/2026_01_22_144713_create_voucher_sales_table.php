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

            $table->foreignId('tenant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            // channel penjualan
            $table->enum('channel_type', ['isp_outlet', 'isp_teknisi', 'business_admin']);

            // outlet_id / teknisi_id / null (admin bisnis)
            $table->foreignId('channel_id')->nullable();

            // user yang melakukan penjualan
            $table->foreignId('sold_by_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamp('sold_at')->nullable();

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

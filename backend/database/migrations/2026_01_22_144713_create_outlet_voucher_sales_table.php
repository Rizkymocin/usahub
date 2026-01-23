<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('outlet_voucher_sales', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');

            $table->foreignId('outlet_id')
                ->references('id')
                ->on('isp_outlets')
                ->onDelete('cascade');

            $table->foreignId('reseller_id')
                ->references('id')
                ->on('isp_resellers')
                ->onDelete('restrict');

            $table->foreignId('voucher_id')
                ->references('id')
                ->on('isp_vouchers')
                ->onDelete('restrict');

            $table->unsignedBigInteger('selling_price');
            $table->unsignedBigInteger('reseller_fee');
            $table->unsignedBigInteger('owner_share');

            $table->enum('status', ['unbilled', 'invoiced', 'paid']);
            $table->timestamp('sold_at');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outlet_voucher_sales');
    }
};

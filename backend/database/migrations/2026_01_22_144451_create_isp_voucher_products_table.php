<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('isp_voucher_products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');

            $table->foreignId('business_id')
                ->references('id')
                ->on('businesses')
                ->onDelete('cascade');

            $table->string('name');
            $table->unsignedInteger('duration_value');
            $table->enum('duration_unit', ['hour', 'day', 'month']);

            $table->unsignedBigInteger('selling_price');
            $table->unsignedBigInteger('owner_share');
            $table->unsignedBigInteger('reseller_fee');

            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_voucher_products');
    }
};

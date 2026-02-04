<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('isp_voucher_products', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();

            $table->foreignId('business_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            // contoh: 30 day, 1 month, 12 hour
            $table->unsignedInteger('duration_value');
            $table->string('duration_unit'); // day, month, hour

            $table->decimal('selling_price', 15, 2);

            // pembagian hasil
            $table->decimal('owner_share', 15, 2);
            $table->decimal('reseller_fee', 15, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_voucher_products');
    }
};

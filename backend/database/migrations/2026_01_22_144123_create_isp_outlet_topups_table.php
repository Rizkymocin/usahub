<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('isp_outlet_topups', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();

            $table->foreignId('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');

            $table->foreignId('business_id')
                ->references('id')
                ->on('businesses')
                ->onDelete('cascade');

            $table->foreignId('outlet_id')
                ->references('id')
                ->on('isp_outlets')
                ->onDelete('cascade');

            $table->unsignedBigInteger('amount');
            $table->enum('payment_method', ['cash', 'transfer']);
            $table->uuid('reference_no')->unique();
            $table->dateTime('topup_date');

            $table->foreignId('created_by_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_outlet_topups');
    }
};

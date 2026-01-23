<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('isp_outlets', function (Blueprint $table) {
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

            $table->foreignId('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');

            $table->string('name');
            $table->string('phone');
            $table->string('address');

            $table->unsignedBigInteger('current_balance')->default(0);
            $table->boolean('status')->default(true);

            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_outlets');
    }
};

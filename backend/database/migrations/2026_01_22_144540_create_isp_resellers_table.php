<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('isp_resellers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');

            $table->foreignId('outlet_id')
                ->references('id')
                ->on('isp_outlets')
                ->onDelete('cascade');

            $table->string('code')->unique();
            $table->string('name');
            $table->string('phone');
            $table->text('address')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_resellers');
    }
};

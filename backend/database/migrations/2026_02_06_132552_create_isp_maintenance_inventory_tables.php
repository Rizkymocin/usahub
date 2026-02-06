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
        Schema::create('isp_maintenance_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('name');
            $table->string('unit')->default('pcs');
            $table->integer('stock')->default(0);
            $table->decimal('price', 12, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('isp_maintenance_log_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('log_id')->constrained('isp_maintenance_logs')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('isp_maintenance_items')->cascadeOnDelete();
            $table->integer('quantity');
            $table->text('notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_maintenance_log_items');
        Schema::dropIfExists('isp_maintenance_items');
    }
};

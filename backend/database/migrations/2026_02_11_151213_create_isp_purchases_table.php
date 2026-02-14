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
        Schema::create('isp_purchases', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('tenant_id')->constrained();
            $table->foreignId('business_id')->constrained();
            $table->dateTime('purchase_date');
            $table->string('type')->default('general'); // maintenance, general, etc
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('supplier_name')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('isp_purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('isp_purchase_id')->constrained()->cascadeOnDelete();
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->foreignId('isp_maintenance_item_id')->nullable()->constrained('isp_maintenance_items')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('isp_purchase_items');
        Schema::dropIfExists('isp_purchases');
    }
};

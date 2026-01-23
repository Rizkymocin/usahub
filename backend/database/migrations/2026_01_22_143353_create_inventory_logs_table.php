<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('raw_material_id')
                ->references('id')
                ->on('raw_materials')
                ->onDelete('cascade');

            $table->foreignId('transaction_id')
                ->nullable()
                ->references('id')
                ->on('pos_transactions')
                ->onDelete('set null');

            $table->enum('type', ['in', 'out']);
            $table->double('qty');
            $table->text('note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};

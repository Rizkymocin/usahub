<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_compositions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');

            $table->foreignId('raw_material_id')
                ->references('id')
                ->on('raw_materials')
                ->onDelete('cascade');

            $table->double('qty_used');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_compositions');
    }
};

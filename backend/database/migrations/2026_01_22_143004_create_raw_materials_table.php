<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('raw_materials', function (Blueprint $table) {
            $table->id();

            $table->foreignId('business_id')
                ->references('id')
                ->on('businesses')
                ->onDelete('cascade');

            $table->foreignId('unit_id')
                ->references('id')
                ->on('units')
                ->onDelete('restrict');

            $table->string('name');
            $table->double('stock');
            $table->unsignedBigInteger('cost_per_unit');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raw_materials');
    }
};

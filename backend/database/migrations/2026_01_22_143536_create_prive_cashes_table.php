<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prive_cash', function (Blueprint $table) {
            $table->id();

            $table->foreignId('business_id')
                ->references('id')
                ->on('businesses')
                ->onDelete('cascade');

            $table->unsignedBigInteger('amount');
            $table->text('note')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prive_cash');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('journal_lines', function (Blueprint $table) {
            $table->id();

            $table->foreignId('journal_entry_id')
                ->references('id')
                ->on('journal_entries')
                ->onDelete('cascade');

            $table->foreignId('account_id')
                ->references('id')
                ->on('accounts')
                ->onDelete('restrict');

            $table->unsignedBigInteger('amount');
            $table->enum('position', ['debit', 'credit']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_lines');
    }
};

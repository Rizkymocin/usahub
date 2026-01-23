<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('isp_financial_transactions', function (Blueprint $table) {
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

            $table->foreignId('journal_entry_id')
                ->references('id')
                ->on('journal_entries')
                ->onDelete('cascade');

            $table->enum('type', ['income', 'expense']);
            $table->enum('source_type', ['outlet_topup', 'sale', 'operational_cost']);
            $table->unsignedBigInteger('source_id');

            $table->unsignedBigInteger('amount');
            $table->dateTime('transaction_date');

            $table->foreignId('created_by_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_financial_transactions');
    }
};

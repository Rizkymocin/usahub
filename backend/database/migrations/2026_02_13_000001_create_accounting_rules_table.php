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
        Schema::create('accounting_rules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained('tenants')
                ->cascadeOnDelete();

            $table->foreignId('business_id')
                ->nullable()
                ->constrained('businesses')
                ->cascadeOnDelete();

            // Event identification
            $table->string('event_code', 50)->index(); // EVT_VOUCHER_SOLD, etc.
            $table->string('rule_name');
            $table->integer('priority')->default(1); // Lower = higher priority

            // Condition matching
            $table->json('condition_json')->nullable(); // {} = always match

            // Journal line creation
            $table->foreignId('account_id')
                ->constrained('accounts')
                ->restrictOnDelete();

            $table->enum('direction', ['DEBIT', 'CREDIT']);
            $table->string('amount_source', 50); // total_amount, cash_amount, etc.

            // Audit requirements
            $table->boolean('collector_required')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Composite index for rule lookup
            $table->index(['event_code', 'is_active', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounting_rules');
    }
};

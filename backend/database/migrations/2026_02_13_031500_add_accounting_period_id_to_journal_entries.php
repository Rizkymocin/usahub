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
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('accounting_period_id')->nullable()->after('business_id');
            $table->index('accounting_period_id', 'idx_period');
            $table->foreign('accounting_period_id')->references('id')->on('accounting_periods')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropForeign(['accounting_period_id']);
            $table->dropIndex('idx_period');
            $table->dropColumn('accounting_period_id');
        });
    }
};

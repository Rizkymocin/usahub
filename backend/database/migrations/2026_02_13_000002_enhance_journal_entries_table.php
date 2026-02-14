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
            // Event tracking
            $table->string('event_code', 50)->nullable()->after('journal_date');
            $table->json('context_json')->nullable()->after('description');

            // Index for event-based queries
            $table->index('event_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropIndex(['event_code']);
            $table->dropColumn(['event_code', 'context_json']);
        });
    }
};

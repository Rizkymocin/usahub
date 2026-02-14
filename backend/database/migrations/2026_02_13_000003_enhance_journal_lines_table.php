<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('journal_lines', function (Blueprint $table) {
            // Replace 'position' with 'direction' for clarity
            $table->enum('direction', ['DEBIT', 'CREDIT'])->after('account_id');

            // Audit trail - who handled this transaction
            $table->foreignId('finance_user_id')
                ->nullable()
                ->after('amount')
                ->constrained('users')
                ->nullOnDelete();

            // Channel tracking - where did this come from
            $table->string('channel_type', 50)->nullable()->after('finance_user_id'); // finance, outlet, system
            $table->unsignedBigInteger('channel_id')->nullable()->after('channel_type');

            // Customer tracking for receivables
            $table->foreignId('customer_id')
                ->nullable()
                ->after('channel_id')
                ->constrained('isp_resellers')
                ->nullOnDelete();

            // Timestamps for audit
            $table->timestamps();

            // Indexes
            $table->index(['finance_user_id', 'created_at']);
            $table->index('customer_id');
        });

        // Migrate existing 'position' data to 'direction'
        DB::statement("UPDATE journal_lines SET direction = UPPER(position)");

        // Drop old 'position' column
        Schema::table('journal_lines', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_lines', function (Blueprint $table) {
            // Restore 'position' column
            $table->enum('position', ['debit', 'credit'])->after('account_id');
        });

        // Migrate 'direction' back to 'position'
        DB::statement("UPDATE journal_lines SET position = LOWER(direction)");

        Schema::table('journal_lines', function (Blueprint $table) {
            // Drop new columns
            $table->dropIndex(['finance_user_id', 'created_at']);
            $table->dropIndex(['customer_id']);

            $table->dropForeign(['finance_user_id']);
            $table->dropForeign(['customer_id']);

            $table->dropColumn([
                'direction',
                'finance_user_id',
                'channel_type',
                'channel_id',
                'customer_id',
                'created_at',
                'updated_at'
            ]);
        });
    }
};

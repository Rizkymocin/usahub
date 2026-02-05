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
        Schema::table('voucher_sales', function (Blueprint $table) {
            // Source tracking (where the stock came from)
            $table->enum('source_type', ['allocated_stock', 'own_stock'])
                ->after('business_id')
                ->nullable(); // Nullable for backward compatibility

            $table->unsignedBigInteger('source_id')
                ->nullable()
                ->after('source_type');

            // Sold to tracking (who bought the voucher)
            $table->enum('sold_to_type', ['reseller', 'outlet', 'end_user'])
                ->after('source_id')
                ->nullable(); // Nullable for backward compatibility

            $table->unsignedBigInteger('sold_to_id')
                ->nullable()
                ->after('sold_to_type');

            // End-user information (if sold_to_type = 'end_user')
            $table->string('customer_name')->nullable()->after('sold_to_id');
            $table->string('customer_phone')->nullable()->after('customer_name');

            // Indexes for performance
            $table->index(['source_type', 'source_id']);
            $table->index(['sold_to_type', 'sold_to_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_sales', function (Blueprint $table) {
            $table->dropIndex(['source_type', 'source_id']);
            $table->dropIndex(['sold_to_type', 'sold_to_id']);

            $table->dropColumn([
                'source_type',
                'source_id',
                'sold_to_type',
                'sold_to_id',
                'customer_name',
                'customer_phone'
            ]);
        });
    }
};

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
        Schema::table('isp_prospects', function (Blueprint $table) {
            $table->unsignedBigInteger('uplink_reseller_id')->nullable()->after('sales_id');
            // We can't easily add foreign key constraint if isp_resellers table is not guaranteed to exist or if it creates circular dependency.
            // But usually isp_resellers exists. Let's add constraint if possible, or just index.
            // Assuming isp_resellers table exists.
        });

        Schema::table('isp_resellers', function (Blueprint $table) {
            $table->unsignedBigInteger('uplink_reseller_id')->nullable()->after('outlet_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('isp_prospects', function (Blueprint $table) {
            $table->dropColumn('uplink_reseller_id');
        });

        Schema::table('isp_resellers', function (Blueprint $table) {
            $table->dropColumn('uplink_reseller_id');
        });
    }
};

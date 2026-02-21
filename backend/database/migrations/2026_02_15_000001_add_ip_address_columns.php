<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('isp_prospects', function (Blueprint $table) {
            $table->string('ip_address')->nullable()->after('status');
            $table->integer('cidr')->nullable()->after('ip_address');
        });

        Schema::table('isp_resellers', function (Blueprint $table) {
            $table->string('ip_address')->nullable()->after('address');
            $table->integer('cidr')->nullable()->after('ip_address');
        });
    }

    public function down(): void
    {
        Schema::table('isp_prospects', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'cidr']);
        });

        Schema::table('isp_resellers', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'cidr']);
        });
    }
};

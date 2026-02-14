<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create readiness confirmation table
        Schema::create('isp_installation_readiness', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained('isp_prospects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('confirmed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['prospect_id', 'user_id']); // Prevent duplicate confirmations
        });

        // Add assigned_technician_id to prospects
        Schema::table('isp_prospects', function (Blueprint $table) {
            $table->foreignId('assigned_technician_id')->nullable()->after('maintenance_issue_id')->constrained('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('isp_prospects', function (Blueprint $table) {
            $table->dropForeign(['assigned_technician_id']);
            $table->dropColumn('assigned_technician_id');
        });

        Schema::dropIfExists('isp_installation_readiness');
    }
};

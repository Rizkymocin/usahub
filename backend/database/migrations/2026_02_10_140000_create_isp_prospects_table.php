<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('isp_prospects', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->foreignId('outlet_id')->nullable()->constrained('isp_outlets')->onDelete('cascade');
            $table->foreignId('sales_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('phone');
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status')->default('waiting'); // waiting, approved, rejected, installed, installation_rejected, activated
            $table->text('admin_note')->nullable();
            $table->text('technician_note')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('installed_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->foreignId('maintenance_issue_id')->nullable()->constrained('isp_maintenance_issues')->onDelete('set null');
            $table->timestamps();
        });

        // Drop the old registrations table
        Schema::dropIfExists('isp_reseller_registrations');
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_prospects');

        // Recreate the old table on rollback
        Schema::create('isp_reseller_registrations', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->foreignId('reseller_id')->constrained('isp_resellers')->onDelete('cascade');
            $table->foreignId('sales_id')->constrained('users')->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }
};

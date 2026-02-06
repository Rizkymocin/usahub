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
        Schema::create('isp_maintenance_issues', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            // Link to Reseller who is experiencing the issue
            $table->foreignId('reseller_id')->nullable()->constrained('isp_resellers')->onDelete('cascade');
            // Optional: Link to specific Outlet if needed in future (nullable)
            $table->foreignId('outlet_id')->nullable()->constrained('isp_outlets')->onDelete('set null');

            // Reporter (User who created the ticket)
            $table->foreignId('reporter_id')->constrained('users');

            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('type', ['infra', 'cpe', 'other'])->default('other');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['pending', 'assigned', 'in_progress', 'resolved', 'closed'])->default('pending');

            // Technician assigned
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users');

            $table->timestamp('reported_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('isp_maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('issue_id')->constrained('isp_maintenance_issues')->onDelete('cascade');
            $table->foreignId('technician_id')->constrained('users');

            $table->text('action_taken');
            $table->enum('result', ['success', 'pending', 'failed'])->default('success');
            $table->text('notes')->nullable();

            // Store photos as JSON array of paths/urls
            $table->json('photos')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_maintenance_logs');
        Schema::dropIfExists('isp_maintenance_issues');
    }
};

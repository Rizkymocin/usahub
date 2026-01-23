<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reseller_invoices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');

            $table->foreignId('outlet_id')
                ->references('id')
                ->on('isp_outlets')
                ->onDelete('cascade');

            $table->foreignId('reseller_id')
                ->references('id')
                ->on('isp_resellers')
                ->onDelete('restrict');

            $table->string('invoice_number')->unique();
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedBigInteger('total_amount');

            $table->enum('status', ['draft', 'issued', 'paid']);
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reseller_invoices');
    }
};

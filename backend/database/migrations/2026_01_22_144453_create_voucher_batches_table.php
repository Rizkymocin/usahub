<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('isp_voucher_batches', function (Blueprint $table) {
            $table->id();

            $table->foreignId('isp_topup_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('total_amount', 15, 2);

            // admin / field operator yang generate batch
            $table->foreignId('created_by_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamp('generated_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_voucher_batches');
    }
};

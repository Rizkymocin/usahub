<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('isp_topups', function (Blueprint $table) {
            $table->id();

            $table->foreignId('outlet_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('amount', 15, 2);

            $table->enum('status', ['requested', 'paid', 'approved'])
                ->default('requested');

            $table->timestamp('requested_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('approved_at')->nullable();

            // user yang mengajukan (outlet / field operator)
            $table->foreignId('created_by_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // user yang menyetujui (admin / kasir)
            $table->foreignId('approved_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('isp_topups');
    }
};

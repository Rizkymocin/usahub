<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('isp_resellers', function (Blueprint $table) {
            if (!Schema::hasColumn('isp_resellers', 'business_id')) {
                // Add column first as nullable
                $table->unsignedBigInteger('business_id')->nullable()->after('tenant_id');

                // Add index
                $table->index('business_id');

                // Add FK
                $table->foreign('business_id')
                    ->references('id')
                    ->on('businesses')
                    ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('isp_resellers', function (Blueprint $table) {
            $table->dropForeign(['business_id']);
            $table->dropColumn('business_id');
        });
    }
};

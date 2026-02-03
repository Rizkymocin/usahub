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
        Schema::table('users', function (Blueprint $table) {
            // PIN login (hash)
            $table->string('pin_hash', 255)
                ->nullable()
                ->after('password');

            // nomor HP sebagai identifier outlet
            $table->string('phone', 20)
                ->nullable()
                ->unique()
                ->after('email');

            // status user (blokir outlet kalau perlu)
            $table->boolean('is_active')
                ->default(true)
                ->after('pin_hash');

            // opsional: kunci ke device tertentu
            $table->string('device_id')
                ->nullable()
                ->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'pin_hash',
                'phone',
                'is_active',
                'device_id',
            ]);
        });
    }
};

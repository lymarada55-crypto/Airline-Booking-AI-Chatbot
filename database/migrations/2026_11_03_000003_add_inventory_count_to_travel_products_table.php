<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('travel_products', function (Blueprint $table) {
            $table->unsignedInteger('inventory_count')->default(10)->after('max_guests');
        });
    }

    public function down(): void
    {
        Schema::table('travel_products', function (Blueprint $table) {
            $table->dropColumn('inventory_count');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('travel_service_reservations', function (Blueprint $table) {
            $table->string('payment_status', 20)->default('unpaid')->after('status')->index();
        });

        Schema::create('travel_service_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_service_reservation_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('transaction_id')->unique();
            $table->unsignedInteger('amount');
            $table->string('payment_method', 50);
            $table->string('status', 20)->default('success');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_service_payments');

        Schema::table('travel_service_reservations', function (Blueprint $table) {
            $table->dropColumn('payment_status');
        });
    }
};

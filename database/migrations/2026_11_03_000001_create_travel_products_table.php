<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_products', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20)->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('city')->index();
            $table->string('location')->nullable();
            $table->text('description');
            $table->string('image_url')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('price_unit', 20);
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedSmallInteger('max_guests')->default(1);
            $table->json('details')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_demo')->default(false);
            $table->timestamps();

            $table->index(['type', 'is_active', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_products');
    }
};

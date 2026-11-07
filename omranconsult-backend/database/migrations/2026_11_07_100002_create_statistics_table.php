<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistics', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 64)->unique();
            $table->decimal('value', 15, 2);
            $table->json('unit')->nullable();
            $table->string('suffix', 8)->nullable();
            $table->string('scale', 16)->nullable();
            $table->json('label');
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 16)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistics');
    }
};

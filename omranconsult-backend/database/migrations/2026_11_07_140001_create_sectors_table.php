<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Project sectors (SDD §6.7 P17, A29).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sectors', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->json('name');
            $table->string('default_image', 64)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 16)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'sort_order']);
        });

        Schema::table('projects', function (Blueprint $table): void {
            $table->foreignId('sector_id')->nullable()->after('client_id')->constrained('sectors')->nullOnDelete();
            $table->index(['status', 'sector_id']);
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropIndex(['status', 'sector_id']);
            $table->dropConstrainedForeignId('sector_id');
        });

        Schema::dropIfExists('sectors');
    }
};

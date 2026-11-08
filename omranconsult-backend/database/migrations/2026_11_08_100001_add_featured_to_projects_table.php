<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Home featured projects (SDD §6.7 P24).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->boolean('is_featured')->default(false)->after('gallery');
            $table->unsignedSmallInteger('featured_order')->nullable()->after('is_featured');
            $table->index(['status', 'is_featured', 'featured_order']);
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropIndex(['status', 'is_featured', 'featured_order']);
            $table->dropColumn(['is_featured', 'featured_order']);
        });
    }
};

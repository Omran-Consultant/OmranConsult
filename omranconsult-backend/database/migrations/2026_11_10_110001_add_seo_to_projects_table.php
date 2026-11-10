<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->json('seo')->nullable()->after('sort_order');
            $table->foreignId('og_image_media_id')->nullable()->after('seo')->constrained('media')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('og_image_media_id');
            $table->dropColumn('seo');
        });
    }
};

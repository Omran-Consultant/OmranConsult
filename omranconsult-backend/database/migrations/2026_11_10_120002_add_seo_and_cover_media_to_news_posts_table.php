<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news_posts', function (Blueprint $table): void {
            $table->json('seo')->nullable()->after('tags');
            $table->foreignId('cover_media_id')->nullable()->after('cover_image')->constrained('media')->nullOnDelete();
            $table->foreignId('og_image_media_id')->nullable()->after('seo')->constrained('media')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('news_posts', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('og_image_media_id');
            $table->dropConstrainedForeignId('cover_media_id');
            $table->dropColumn('seo');
        });
    }
};

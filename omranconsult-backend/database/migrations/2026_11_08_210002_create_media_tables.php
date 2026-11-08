<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table): void {
            $table->id();
            $table->string('disk', 32);
            $table->string('path');
            $table->string('filename');
            $table->string('original_filename')->nullable();
            $table->string('mime_type', 127);
            $table->unsignedBigInteger('size_bytes');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->json('alt')->nullable();
            $table->json('caption')->nullable();
            $table->decimal('focal_x', 5, 2)->nullable();
            $table->decimal('focal_y', 5, 2)->nullable();
            $table->json('variants')->nullable();
            $table->string('import_key', 128)->nullable()->unique();
            $table->boolean('is_private')->default(false);
            $table->date('retention_until')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index('created_at');
            $table->index('mime_type');
        });

        Schema::create('media_references', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('media_id')->constrained('media')->restrictOnDelete();
            $table->string('referencer_type');
            $table->unsignedBigInteger('referencer_id');
            $table->string('field', 64);
            $table->timestamps();
            $table->unique(['media_id', 'referencer_type', 'referencer_id', 'field'], 'media_references_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_references');
        Schema::dropIfExists('media');
    }
};

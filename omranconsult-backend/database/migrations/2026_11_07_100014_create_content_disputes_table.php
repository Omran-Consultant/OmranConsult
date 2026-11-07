<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_disputes', function (Blueprint $table): void {
            $table->id();
            $table->string('dispute_class', 16)->default('editorial');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('field_path')->nullable();
            $table->string('issue_code', 64);
            $table->text('description');
            $table->json('reference_snapshot')->nullable();
            $table->string('status', 16)->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->text('resolution_reason')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id', 'status']);
            $table->index(['dispute_class', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_disputes');
    }
};

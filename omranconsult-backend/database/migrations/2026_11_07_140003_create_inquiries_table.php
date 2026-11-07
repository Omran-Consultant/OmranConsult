<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Inquiries inbox (SDD §6.7 P19, §7.2). Replaces contact_messages (A29).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('organisation', 160)->nullable();
            $table->string('email', 190);
            $table->string('phone', 20)->nullable();
            $table->string('service_type')->nullable();
            $table->text('message')->nullable();
            $table->boolean('consent')->default(false);
            $table->string('source', 16);
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->char('locale', 2);
            $table->string('status', 16)->default('new');
            $table->string('ip_hash', 64);
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};

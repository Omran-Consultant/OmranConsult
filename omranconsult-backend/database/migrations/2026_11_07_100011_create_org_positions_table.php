<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_positions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('team_member_id')->nullable()->constrained('team_members')->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('org_positions')->nullOnDelete();
            $table->string('group', 32);
            $table->json('title');
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 16)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'group', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_positions');
    }
};

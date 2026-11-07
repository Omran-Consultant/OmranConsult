<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_region', function (Blueprint $table): void {
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('region_id')->constrained()->cascadeOnDelete();
            $table->primary(['project_id', 'region_id']);
            $table->index('region_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_region');
    }
};

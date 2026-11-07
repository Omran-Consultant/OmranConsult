<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_categories', function (Blueprint $table): void {
            $table->string('kind', 32)->default('axis')->after('slug');
            $table->index(['kind', 'status', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::table('service_categories', function (Blueprint $table): void {
            $table->dropIndex(['kind', 'status', 'sort_order']);
            $table->dropColumn('kind');
        });
    }
};

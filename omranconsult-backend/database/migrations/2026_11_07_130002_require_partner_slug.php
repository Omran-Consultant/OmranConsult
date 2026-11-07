<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table): void {
            $table->string('slug', 64)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table): void {
            $table->string('slug', 64)->nullable()->change();
        });
    }
};

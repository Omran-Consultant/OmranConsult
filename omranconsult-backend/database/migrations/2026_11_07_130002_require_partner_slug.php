<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $slugsBySortOrder = [
            1 => 'oliver-wyman',
            2 => 'musanadah',
            3 => 'tacent',
            4 => 'bureau-veritas',
        ];

        foreach ($slugsBySortOrder as $sortOrder => $slug) {
            DB::table('partners')
                ->where('sort_order', $sortOrder)
                ->whereNull('slug')
                ->update(['slug' => $slug]);
        }

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

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table): void {
            $table->timestamp('consented_at')->nullable()->after('message');
        });

        DB::table('inquiries')
            ->where('consent', true)
            ->update(['consented_at' => DB::raw('created_at')]);

        Schema::table('inquiries', function (Blueprint $table): void {
            $table->dropColumn('consent');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table): void {
            $table->boolean('consent')->default(false)->after('message');
        });

        DB::table('inquiries')
            ->whereNotNull('consented_at')
            ->update(['consent' => true]);

        Schema::table('inquiries', function (Blueprint $table): void {
            $table->dropColumn('consented_at');
        });
    }
};

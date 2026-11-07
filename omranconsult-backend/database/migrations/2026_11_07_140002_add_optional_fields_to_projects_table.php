<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Optional project facts (SDD §6.7 P18). All nullable: the profile does not give them.
 * `delivery_status` is not named `status`, which is the publication state.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->unsignedSmallInteger('year')->nullable()->after('title');
            $table->json('location')->nullable()->after('year');
            $table->json('service_type')->nullable()->after('location');
            $table->string('delivery_status', 16)->nullable()->after('service_type');
            $table->json('overview')->nullable()->after('delivery_status');
            $table->json('scope')->nullable()->after('overview');
            $table->json('gallery')->nullable()->after('scope');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropColumn(['year', 'location', 'service_type', 'delivery_status', 'overview', 'scope', 'gallery']);
        });
    }
};

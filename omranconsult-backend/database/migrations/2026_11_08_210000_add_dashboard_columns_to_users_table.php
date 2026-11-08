<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_active')->default(true)->after('password');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->timestamp('locked_until')->nullable()->after('last_login_at');
            $table->unsignedTinyInteger('failed_login_count')->default(0)->after('locked_until');
            $table->text('mfa_secret')->nullable()->after('failed_login_count');
            $table->json('mfa_recovery_codes')->nullable()->after('mfa_secret');
            $table->timestamp('mfa_enabled_at')->nullable()->after('mfa_recovery_codes');
            $table->boolean('notify_inquiries')->default(true)->after('mfa_enabled_at');
            $table->string('dashboard_locale', 2)->nullable()->after('notify_inquiries');
            $table->string('department', 80)->nullable()->after('dashboard_locale');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'is_active',
                'last_login_at',
                'locked_until',
                'failed_login_count',
                'mfa_secret',
                'mfa_recovery_codes',
                'mfa_enabled_at',
                'notify_inquiries',
                'dashboard_locale',
                'department',
            ]);
        });
    }
};

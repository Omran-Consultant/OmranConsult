<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Notifications\AdminResetPasswordNotification;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\Support\InteractsWithSanctumSpa;
use Tests\TestCase;

class AdminPasswordResetTest extends TestCase
{
    use InteractsWithSanctumSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SuperAdminRoleSeeder::class);
    }

    public function test_forgot_password_always_returns_the_same_200(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'reset@omranconsult.test']);
        $user->assignRole(SuperAdminRole::NAME);
        $this->initializeSanctumSpaSession();

        $known = $this->postSanctumSpaJson('/api/admin/forgot-password', [
            'email' => 'reset@omranconsult.test',
        ]);
        $unknown = $this->postSanctumSpaJson('/api/admin/forgot-password', [
            'email' => 'missing@omranconsult.test',
        ]);

        $known->assertOk();
        $unknown->assertOk();
        $this->assertSame($known->json('message'), $unknown->json('message'));
        Notification::assertSentTo($user, AdminResetPasswordNotification::class);
    }

    public function test_reset_token_is_single_use_and_enforces_password_policy(): void
    {
        $user = User::factory()->create(['email' => 'reset@omranconsult.test']);
        $user->assignRole(SuperAdminRole::NAME);
        $this->initializeSanctumSpaSession();

        $token = Password::createToken($user);

        $this->postSanctumSpaJson('/api/admin/reset-password', [
            'token' => $token,
            'email' => 'reset@omranconsult.test',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertUnprocessable();

        $this->postSanctumSpaJson('/api/admin/reset-password', [
            'token' => $token,
            'email' => 'reset@omranconsult.test',
            'password' => 'ValidPass12!',
            'password_confirmation' => 'ValidPass12!',
        ])->assertOk();

        $this->postSanctumSpaJson('/api/admin/reset-password', [
            'token' => $token,
            'email' => 'reset@omranconsult.test',
            'password' => 'AnotherPass12!',
            'password_confirmation' => 'AnotherPass12!',
        ])->assertUnprocessable();
    }
}

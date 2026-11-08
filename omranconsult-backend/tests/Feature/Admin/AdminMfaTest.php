<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
use Tests\Support\InteractsWithSanctumSpa;
use Tests\TestCase;

class AdminMfaTest extends TestCase
{
    use InteractsWithSanctumSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SuperAdminRoleSeeder::class);
    }

    public function test_password_ok_with_mfa_enabled_returns_pending_state_then_code_logs_in(): void
    {
        $google2fa = new Google2FA;
        $secret = $google2fa->generateSecretKey();
        $user = $this->mfaUser('mfa@omranconsult.test', $secret);
        $this->initializeSanctumSpaSession();

        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'mfa@omranconsult.test',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertExactJson(['mfa_required' => true]);
        $this->assertGuest();

        $this->postSanctumSpaJson('/api/admin/login/mfa', [
            'code' => $google2fa->getCurrentOtp($secret),
        ])
            ->assertOk()
            ->assertJsonPath('user.email', 'mfa@omranconsult.test');
        $this->assertAuthenticatedAs($user);
    }

    public function test_reused_totp_code_is_rejected(): void
    {
        $google2fa = new Google2FA;
        $secret = $google2fa->generateSecretKey();
        $this->mfaUser('reuse@omranconsult.test', $secret);
        $this->initializeSanctumSpaSession();

        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'reuse@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $code = $google2fa->getCurrentOtp($secret);
        $this->postSanctumSpaJson('/api/admin/login/mfa', ['code' => $code])->assertOk();
        $this->postSanctumSpaJson('/api/admin/logout')->assertOk();

        $this->initializeSanctumSpaSession();
        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'reuse@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $this->postSanctumSpaJson('/api/admin/login/mfa', ['code' => $code])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['code']);
    }

    public function test_setup_confirm_enable_and_disable_mfa(): void
    {
        $google2fa = new Google2FA;
        $user = $this->mfaUser('setup@omranconsult.test');
        $this->initializeSanctumSpaSession();
        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'setup@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $start = $this->postSanctumSpaJson('/api/admin/me/mfa/start');
        $start->assertOk()->assertJsonStructure(['secret', 'qr_svg']);
        $secret = (string) $start->json('secret');

        $confirm = $this->postSanctumSpaJson('/api/admin/me/mfa/confirm', [
            'code' => $google2fa->getCurrentOtp($secret),
        ]);
        $confirm->assertOk();
        $this->assertCount(8, $confirm->json('recovery_codes'));
        $this->assertTrue($user->fresh()->mfaIsEnabled());

        $this->withHeaders(array_merge($this->sanctumSpaHeaders(), [
            'X-XSRF-TOKEN' => session()->token(),
        ]))->deleteJson('/api/admin/me/mfa', [
            'password' => 'password',
            'code' => $google2fa->getCurrentOtp($secret),
        ])->assertOk();

        $this->assertFalse($user->fresh()->mfaIsEnabled());
    }

    public function test_recovery_code_is_single_use(): void
    {
        $google2fa = new Google2FA;
        $user = $this->mfaUser('recovery@omranconsult.test');
        $this->initializeSanctumSpaSession();
        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'recovery@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $start = $this->postSanctumSpaJson('/api/admin/me/mfa/start')->assertOk();
        $secret = (string) $start->json('secret');
        $confirm = $this->postSanctumSpaJson('/api/admin/me/mfa/confirm', [
            'code' => $google2fa->getCurrentOtp($secret),
        ])->assertOk();
        $recovery = (string) $confirm->json('recovery_codes.0');

        $this->postSanctumSpaJson('/api/admin/logout')->assertOk();
        $this->initializeSanctumSpaSession();
        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'recovery@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $this->postSanctumSpaJson('/api/admin/login/mfa', [
            'recovery_code' => $recovery,
        ])->assertOk();
        $this->postSanctumSpaJson('/api/admin/logout')->assertOk();

        $this->initializeSanctumSpaSession();
        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'recovery@omranconsult.test',
            'password' => 'password',
        ])->assertOk();
        $this->postSanctumSpaJson('/api/admin/login/mfa', [
            'recovery_code' => $recovery,
        ])->assertUnprocessable();
    }

    private function mfaUser(string $email, ?string $secret = null): User
    {
        $user = User::factory()->create([
            'email' => $email,
            'mfa_secret' => $secret,
            'mfa_enabled_at' => $secret ? now() : null,
        ]);
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

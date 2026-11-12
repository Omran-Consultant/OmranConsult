<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\Audit\Infrastructure\Models\AuditLog;
use App\Support\Auth\AccountLockout;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\Support\InteractsWithSanctumSpa;
use Tests\TestCase;

class AdminLockoutTest extends TestCase
{
    use InteractsWithSanctumSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SuperAdminRoleSeeder::class);
        Cache::flush();
    }

    public function test_five_failed_attempts_within_window_lock_the_account_with_423(): void
    {
        $user = $this->dashboardUser(['email' => 'lock@omranconsult.test']);
        $this->initializeSanctumSpaSession();

        for ($i = 0; $i < 4; $i++) {
            $this->postSanctumSpaJson('/api/admin/login', [
                'email' => 'lock@omranconsult.test',
                'password' => 'wrong-password',
            ])->assertUnprocessable();
        }

        $locked = $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'lock@omranconsult.test',
            'password' => 'wrong-password',
        ]);

        $locked
            ->assertStatus(423)
            ->assertJsonPath('message', 'account_locked');
        $this->assertSame(AccountLockout::LOCK_MINUTES, (int) $locked->json('minutes_remaining'));

        $this->assertNotNull($user->fresh()->locked_until);
        $this->assertTrue(AuditLog::query()->where('action', 'account_locked')->exists());
        $this->assertTrue(AuditLog::query()->where('action', 'login_failed')->exists());
        foreach (AuditLog::query()->get() as $row) {
            $encoded = json_encode($row->changes) ?: '';
            $this->assertStringNotContainsString('password', $encoded);
            $this->assertStringNotContainsString('wrong-password', $encoded);
        }
    }

    public function test_unknown_email_never_returns_423(): void
    {
        $this->initializeSanctumSpaSession();

        for ($i = 0; $i < 5; $i++) {
            $this->postSanctumSpaJson('/api/admin/login', [
                'email' => 'missing@omranconsult.test',
                'password' => 'wrong-password',
            ])->assertUnprocessable();
        }
    }

    public function test_editor_can_log_in(): void
    {
        $user = User::factory()->create(['email' => 'editor@omranconsult.test']);
        $user->assignRole(EditorRole::NAME);
        $this->initializeSanctumSpaSession();

        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'editor@omranconsult.test',
            'password' => 'password',
            'remember' => true,
        ])
            ->assertOk()
            ->assertJsonPath('user.roles', [EditorRole::NAME]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function dashboardUser(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

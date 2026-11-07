<?php

namespace Tests\Feature\Console;

use App\Models\User;
use App\Support\SuperAdminRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InstallSuperAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    private const KEYS = ['ADMIN_EMAIL', 'ADMIN_PASSWORD'];

    /**
     * Values the developer's local environment may already hold for KEYS.
     * Laravel's env() reads $_SERVER first, then $_ENV, then getenv(), so the
     * test overrides and restores all three to stay independent of the machine.
     *
     * @var array<string, array{server: mixed, env: mixed, getenv: string|false}>
     */
    private array $originalEnvironment = [];

    protected function setUp(): void
    {
        parent::setUp();

        foreach (self::KEYS as $key) {
            $this->originalEnvironment[$key] = [
                'server' => $_SERVER[$key] ?? null,
                'env' => $_ENV[$key] ?? null,
                'getenv' => getenv($key),
            ];
        }
    }

    protected function tearDown(): void
    {
        foreach ($this->originalEnvironment as $key => $original) {
            $this->restore($_SERVER, $key, $original['server']);
            $this->restore($_ENV, $key, $original['env']);
            putenv($original['getenv'] === false ? $key : "{$key}={$original['getenv']}");
        }

        parent::tearDown();
    }

    public function test_installs_super_admin_when_users_table_is_empty(): void
    {
        $this->setBootstrapCredentials('bootstrap@omranconsult.test', 'securepassword12');

        $this->artisan('omranconsult:install-super-admin')
            ->assertSuccessful()
            ->doesntExpectOutputToContain('securepassword12');

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', [
            'email' => 'bootstrap@omranconsult.test',
        ]);

        $user = User::query()->firstOrFail();
        $this->assertTrue($user->hasRole(SuperAdminRole::NAME));
        $this->assertTrue(
            Role::query()
                ->where('name', SuperAdminRole::NAME)
                ->where('guard_name', SuperAdminRole::GUARD)
                ->exists()
        );
    }

    public function test_refuses_bootstrap_when_any_user_exists(): void
    {
        User::factory()->create();

        $this->setBootstrapCredentials('another@omranconsult.test', 'securepassword12');

        $this->artisan('omranconsult:install-super-admin')
            ->assertFailed();

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseMissing('users', [
            'email' => 'another@omranconsult.test',
        ]);
    }

    public function test_does_not_reset_existing_user_when_bootstrap_refused(): void
    {
        $existing = User::factory()->create([
            'email' => 'existing@omranconsult.test',
        ]);

        $originalHash = $existing->fresh()->password;

        $this->setBootstrapCredentials('existing@omranconsult.test', 'newpassword12345');

        $this->artisan('omranconsult:install-super-admin')
            ->assertFailed()
            ->doesntExpectOutputToContain('newpassword12345');

        $this->assertSame($originalHash, $existing->fresh()->password);
    }

    public function test_rejects_short_admin_password(): void
    {
        $this->setBootstrapCredentials('admin@omranconsult.test', 'short');

        $this->artisan('omranconsult:install-super-admin')
            ->assertFailed()
            ->doesntExpectOutputToContain('short');

        $this->assertDatabaseCount('users', 0);
    }

    private function setBootstrapCredentials(string $email, string $password): void
    {
        foreach (['ADMIN_EMAIL' => $email, 'ADMIN_PASSWORD' => $password] as $key => $value) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }

    /**
     * @param  array<string, mixed>  $store
     */
    private function restore(array &$store, string $key, mixed $value): void
    {
        if ($value === null) {
            unset($store[$key]);

            return;
        }

        $store[$key] = $value;
    }
}

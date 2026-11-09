<?php

namespace Tests\Feature\Console;

use App\Models\User;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EnsureE2eUsersCommandTest extends TestCase
{
    use RefreshDatabase;

    private const KEYS = ['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD'];

    /**
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

    public function test_creates_admin_and_editor_in_testing(): void
    {
        $this->setE2eCredentials('e2e-admin@omran.test', 'ValidPass12!');

        $this->artisan('e2e:ensure-users')
            ->assertSuccessful()
            ->expectsOutputToContain('E2E users are ready.')
            ->doesntExpectOutputToContain('ValidPass12!');

        $admin = User::query()->where('email', 'e2e-admin@omran.test')->firstOrFail();
        $editor = User::query()->where('email', 'e2e-editor@omran.test')->firstOrFail();

        $this->assertTrue($admin->is_active);
        $this->assertTrue($admin->hasRole(SuperAdminRole::NAME));
        $this->assertFalse($admin->mfaIsEnabled());
        $this->assertNull($admin->locked_until);
        $this->assertTrue(Hash::check('ValidPass12!', $admin->password));

        $this->assertTrue($editor->is_active);
        $this->assertTrue($editor->hasRole(EditorRole::NAME));
        $this->assertFalse($editor->mfaIsEnabled());
        $this->assertTrue(Hash::check('ValidPass12!', $editor->password));
    }

    public function test_resets_mfa_and_lock_on_existing_users(): void
    {
        $this->setE2eCredentials('e2e-admin@omran.test', 'ValidPass12!');
        $this->artisan('e2e:ensure-users')->assertSuccessful();

        $admin = User::query()->where('email', 'e2e-admin@omran.test')->firstOrFail();
        $admin->forceFill([
            'mfa_secret' => 'SECRET',
            'mfa_enabled_at' => now(),
            'locked_until' => now()->addMinutes(15),
            'failed_login_count' => 4,
            'is_active' => false,
        ])->save();

        $this->artisan('e2e:ensure-users')->assertSuccessful();

        $admin = $admin->fresh();
        $this->assertTrue($admin->is_active);
        $this->assertFalse($admin->mfaIsEnabled());
        $this->assertNull($admin->locked_until);
        $this->assertSame(0, $admin->failed_login_count);
    }

    public function test_refuses_when_credentials_are_missing(): void
    {
        $this->setE2eCredentials('', '');

        $this->artisan('e2e:ensure-users')->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_refuses_outside_local_and_testing(): void
    {
        $this->setE2eCredentials('e2e-admin@omran.test', 'ValidPass12!');
        $this->app['env'] = 'production';

        $this->artisan('e2e:ensure-users')
            ->assertFailed()
            ->expectsOutputToContain('local or testing')
            ->doesntExpectOutputToContain('ValidPass12!');

        $this->assertDatabaseCount('users', 0);
    }

    private function setE2eCredentials(string $email, string $password): void
    {
        foreach (['E2E_ADMIN_EMAIL' => $email, 'E2E_ADMIN_PASSWORD' => $password] as $key => $value) {
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

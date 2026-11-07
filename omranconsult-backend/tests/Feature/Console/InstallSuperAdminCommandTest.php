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

    protected function tearDown(): void
    {
        putenv('ADMIN_EMAIL');
        putenv('ADMIN_PASSWORD');
        unset($_ENV['ADMIN_EMAIL'], $_ENV['ADMIN_PASSWORD']);

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
        putenv("ADMIN_EMAIL={$email}");
        putenv("ADMIN_PASSWORD={$password}");
        $_ENV['ADMIN_EMAIL'] = $email;
        $_ENV['ADMIN_PASSWORD'] = $password;
    }
}

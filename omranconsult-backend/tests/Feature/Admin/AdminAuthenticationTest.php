<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Tests\Support\InteractsWithSanctumSpa;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use InteractsWithSanctumSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SuperAdminRoleSeeder::class);
    }

    public function test_super_admin_can_log_in_with_valid_credentials(): void
    {
        $user = $this->createSuperAdmin([
            'email' => 'admin@omranconsult.test',
        ]);

        $this->initializeSanctumSpaSession();

        $response = $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'admin@omranconsult.test',
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'admin@omranconsult.test')
            ->assertJsonPath('user.roles', [SuperAdminRole::NAME])
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.mfa_secret');
    }

    public function test_login_rejects_invalid_credentials_without_leaking_account_existence(): void
    {
        $this->createSuperAdmin([
            'email' => 'known@omranconsult.test',
        ]);

        $this->initializeSanctumSpaSession();

        $unknownEmailResponse = $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'missing@omranconsult.test',
            'password' => 'password',
        ]);

        $wrongPasswordResponse = $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'known@omranconsult.test',
            'password' => 'wrong-password',
        ]);

        $unknownEmailResponse->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $wrongPasswordResponse->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertSame(
            $unknownEmailResponse->json('errors.email.0'),
            $wrongPasswordResponse->json('errors.email.0')
        );
        $this->assertStringNotContainsString('wrong-password', $wrongPasswordResponse->getContent());
    }

    public function test_login_rejects_authenticated_user_without_super_admin_role_like_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'editor@omranconsult.test',
        ]);

        $this->initializeSanctumSpaSession();

        $response = $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'editor@omranconsult.test',
            'password' => 'password',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertGuest();
    }

    public function test_login_is_throttled_after_five_attempts_per_minute(): void
    {
        RateLimiter::clear('admin-login');

        $this->initializeSanctumSpaSession();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postSanctumSpaJson('/api/admin/login', [
                'email' => 'missing@omranconsult.test',
                'password' => 'wrong-password',
            ])->assertUnprocessable();
        }

        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'missing@omranconsult.test',
            'password' => 'wrong-password',
        ])->assertTooManyRequests();
    }

    public function test_successful_login_regenerates_the_session_id(): void
    {
        $this->createSuperAdmin([
            'email' => 'admin@omranconsult.test',
        ]);

        $this->initializeSanctumSpaSession();
        $sessionIdBeforeLogin = session()->getId();

        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'admin@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $this->assertNotSame($sessionIdBeforeLogin, session()->getId());
    }

    public function test_me_returns_the_authenticated_super_admin(): void
    {
        $user = $this->createSuperAdmin([
            'email' => 'admin@omranconsult.test',
        ]);

        $this->initializeSanctumSpaSession();
        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'admin@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $response = $this->getJson('/api/admin/me');

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'admin@omranconsult.test')
            ->assertJsonPath('user.roles', [SuperAdminRole::NAME])
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.mfa_secret');
    }

    public function test_logout_invalidates_the_session_and_regenerates_csrf_token(): void
    {
        $this->createSuperAdmin([
            'email' => 'admin@omranconsult.test',
        ]);

        $this->initializeSanctumSpaSession();
        $this->postSanctumSpaJson('/api/admin/login', [
            'email' => 'admin@omranconsult.test',
            'password' => 'password',
        ])->assertOk();

        $sessionIdBeforeLogout = session()->getId();
        $csrfTokenBeforeLogout = session()->token();

        $logoutResponse = $this->postSanctumSpaJson('/api/admin/logout');

        $logoutResponse
            ->assertOk()
            ->assertExactJson(['message' => 'Logged out.']);

        $this->assertGuest('web');
        $this->assertNotSame($sessionIdBeforeLogout, session()->getId());
        $this->assertNotSame($csrfTokenBeforeLogout, session()->token());
    }

    public function test_guest_cannot_access_me(): void
    {
        $this->getJson('/api/admin/me')->assertUnauthorized();
    }

    public function test_authenticated_non_admin_cannot_access_me(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/me')->assertForbidden();
    }

    public function test_sanctum_is_configured_for_csrf_protected_stateful_admin_mutations(): void
    {
        $this->assertSame(
            ValidateCsrfToken::class,
            config('sanctum.middleware.validate_csrf_token')
        );

        $apiMiddleware = app('router')->getMiddlewareGroups()['api'] ?? [];

        $this->assertContains(EnsureFrontendRequestsAreStateful::class, $apiMiddleware);
    }

    public function test_guest_cannot_logout(): void
    {
        $this->initializeSanctumSpaSession();

        $this->postSanctumSpaJson('/api/admin/logout')->assertUnauthorized();
    }

    public function test_login_validates_required_fields(): void
    {
        $this->initializeSanctumSpaSession();

        $this->postSanctumSpaJson('/api/admin/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createSuperAdmin(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

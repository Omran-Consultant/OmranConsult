<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_ping(): void
    {
        $response = $this->getJson('/api/admin/ping');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_without_dashboard_role_receives_forbidden(): void
    {
        $this->seed(SuperAdminRoleSeeder::class);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/ping');

        $response->assertForbidden();
    }

    public function test_editor_can_access_admin_ping(): void
    {
        $this->seed(SuperAdminRoleSeeder::class);

        $user = User::factory()->create();
        $user->assignRole(EditorRole::NAME);

        $this->actingAs($user)->getJson('/api/admin/ping')->assertOk();
    }

    public function test_inactive_dashboard_user_receives_forbidden(): void
    {
        $this->seed(SuperAdminRoleSeeder::class);

        $user = User::factory()->create(['is_active' => false]);
        $user->assignRole(SuperAdminRole::NAME);

        $this->actingAs($user)->getJson('/api/admin/ping')->assertForbidden();
    }

    public function test_super_admin_can_access_admin_ping(): void
    {
        $this->seed(SuperAdminRoleSeeder::class);

        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        $response = $this->actingAs($user)->getJson('/api/admin/ping');

        $response
            ->assertOk()
            ->assertExactJson(['status' => 'ok']);
    }

    public function test_database_seeder_creates_super_admin_and_editor_roles(): void
    {
        $this->seed();

        $this->assertTrue(
            Role::query()
                ->where('name', SuperAdminRole::NAME)
                ->where('guard_name', SuperAdminRole::GUARD)
                ->exists()
        );
        $this->assertTrue(
            Role::query()
                ->where('name', EditorRole::NAME)
                ->where('guard_name', EditorRole::GUARD)
                ->exists()
        );
        $this->assertDatabaseCount('users', 0);
    }
}

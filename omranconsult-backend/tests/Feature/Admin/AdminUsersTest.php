<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\Users\Infrastructure\Models\UserInvitation;
use App\Notifications\UserInvitationNotification;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminUsersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SuperAdminRoleSeeder::class);
    }

    public function test_editor_cannot_list_users(): void
    {
        $editor = $this->userWithRole(EditorRole::NAME);

        $this->actingAs($editor)->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_admin_invites_user_and_accept_creates_account(): void
    {
        Notification::fake();
        $admin = $this->userWithRole(SuperAdminRole::NAME);

        $this->actingAs($admin)->postJson('/api/admin/users', [
            'name' => 'New Editor',
            'email' => 'new-editor@omranconsult.test',
            'role' => EditorRole::NAME,
        ])->assertCreated();

        $invite = UserInvitation::query()->firstOrFail();
        $plain = '';
        Notification::assertSentOnDemand(UserInvitationNotification::class, function (UserInvitationNotification $notification) use (&$plain): bool {
            $plain = $notification->token;

            return true;
        });

        $this->postJson('/api/admin/accept-invite', [
            'token' => $plain,
            'email' => 'new-editor@omranconsult.test',
            'password' => 'ValidPass12!',
            'password_confirmation' => 'ValidPass12!',
        ])
            ->assertOk()
            ->assertJsonPath('user.roles', [EditorRole::NAME]);

        $this->assertNotNull($invite->fresh()->accepted_at);
    }

    public function test_cannot_deactivate_last_super_admin(): void
    {
        $admin = $this->userWithRole(SuperAdminRole::NAME);

        $this->actingAs($admin)->patchJson('/api/admin/users/'.$admin->id, [
            'is_active' => false,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['user']);
    }

    public function test_user_cannot_change_own_role(): void
    {
        $admin = $this->userWithRole(SuperAdminRole::NAME);
        $other = $this->userWithRole(SuperAdminRole::NAME, ['email' => 'other@omranconsult.test']);

        $this->actingAs($admin)->patchJson('/api/admin/users/'.$admin->id, [
            'role' => EditorRole::NAME,
        ])->assertUnprocessable();

        $this->actingAs($admin)->patchJson('/api/admin/users/'.$other->id, [
            'role' => EditorRole::NAME,
        ])->assertOk();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function userWithRole(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }
}

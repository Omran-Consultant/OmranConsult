<?php

namespace Tests\Feature\Console;

use App\Models\User;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Users\Infrastructure\Models\UserInvitation;
use App\Support\EditorRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class E2ePurgeExtrasCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_deletes_throwaway_e2e_users_and_keeps_the_editor(): void
    {
        User::factory()->create(['email' => 'e2e-editor@omran.test', 'name' => 'E2E Editor']);
        User::factory()->create(['email' => 'e2e-invite-1@omran.test', 'name' => 'E2E Invitee']);
        UserInvitation::query()->create([
            'name' => 'Invitee',
            'email' => 'e2e-pending@omran.test',
            'role' => EditorRole::NAME,
            'token_hash' => hash('sha256', 'token'),
            'expires_at' => now()->addHours(72),
        ]);
        Media::query()->create([
            'disk' => 'public',
            'path' => 'files/e2e-valid.jpg',
            'filename' => 'e2e-valid.jpg',
            'original_filename' => 'e2e-valid.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 12,
        ]);

        $this->artisan('e2e:purge-extras')->assertSuccessful();

        $this->assertDatabaseHas('users', ['email' => 'e2e-editor@omran.test']);
        $this->assertDatabaseMissing('users', ['email' => 'e2e-invite-1@omran.test']);
        $this->assertDatabaseMissing('user_invitations', ['email' => 'e2e-pending@omran.test']);
        $this->assertDatabaseMissing('media', ['original_filename' => 'e2e-valid.jpg']);
    }
}

<?php

namespace Tests\Feature\Console;

use App\Modules\Users\Infrastructure\Models\UserInvitation;
use App\Support\EditorRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class E2eInviteUrlCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_prints_accept_url_for_pending_invite(): void
    {
        UserInvitation::query()->create([
            'name' => 'Invitee',
            'email' => 'invitee@omran.test',
            'role' => EditorRole::NAME,
            'token_hash' => hash('sha256', 'old-token'),
            'expires_at' => now()->addHours(72),
        ]);

        $code = Artisan::call('e2e:invite-url', ['email' => 'invitee@omran.test']);
        $output = Artisan::output();
        $this->assertSame(0, $code);
        $this->assertStringContainsString('/dashboard/accept-invite?token=', $output);
        $this->assertStringContainsString('invitee%40omran.test', $output);

        $invite = UserInvitation::query()->firstOrFail();
        $this->assertNotSame(hash('sha256', 'old-token'), $invite->token_hash);
    }

    public function test_refuses_outside_local_and_testing(): void
    {
        $this->app['env'] = 'production';

        $this->artisan('e2e:invite-url', ['email' => 'invitee@omran.test'])
            ->assertFailed()
            ->expectsOutputToContain('local or testing');
    }

    public function test_fails_when_no_pending_invite_exists(): void
    {
        $this->artisan('e2e:invite-url', ['email' => 'missing@omran.test'])->assertFailed();
    }
}

<?php

namespace App\Console\Commands;

use App\Modules\Users\Infrastructure\Models\UserInvitation;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class E2eInviteUrlCommand extends Command
{
    protected $signature = 'e2e:invite-url {email}';

    protected $description = 'Rotate a pending invitation token and print the accept URL (local and testing only).';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->components->error('e2e:invite-url is only available when APP_ENV is local or testing.');

            return self::FAILURE;
        }

        $email = strtolower(trim((string) $this->argument('email')));
        $invite = UserInvitation::query()
            ->whereRaw('lower(email) = ?', [$email])
            ->get()
            ->first(fn (UserInvitation $row): bool => $row->isPending());

        if ($invite === null) {
            $this->components->error('No pending invitation found for that email.');

            return self::FAILURE;
        }

        $plain = Str::lower(Str::random(48));
        $invite->forceFill([
            'token_hash' => hash('sha256', $plain),
            'expires_at' => now()->addHours(72),
        ])->save();

        $frontend = rtrim((string) config('cms.frontend_url', 'http://localhost:3000'), '/');
        $this->line($frontend.'/dashboard/accept-invite?token='.urlencode($plain).'&email='.urlencode($email));

        return self::SUCCESS;
    }
}

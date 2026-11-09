<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Users\Infrastructure\Models\UserInvitation;
use Illuminate\Console\Command;

class E2ePurgeExtrasCommand extends Command
{
    protected $signature = 'e2e:purge-extras';

    protected $description = 'Delete leftover Playwright users, invites, and e2e uploads from the isolated E2E database.';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->components->error('e2e:purge-extras is only available when APP_ENV is local or testing.');

            return self::FAILURE;
        }

        $adminEmail = strtolower(trim((string) env('E2E_ADMIN_EMAIL')));
        $keep = array_values(array_filter([$adminEmail, 'e2e-editor@omran.test']));

        $users = User::query()
            ->where('email', 'like', 'e2e-%@omran.test')
            ->when($keep !== [], fn ($query) => $query->whereNotIn('email', $keep))
            ->delete();

        $invites = UserInvitation::query()
            ->where('email', 'like', 'e2e-%@omran.test')
            ->delete();

        $media = Media::query()
            ->where('original_filename', 'like', 'e2e-%')
            ->forceDelete();

        $this->components->info("Purged extras: {$users} user(s), {$invites} invitation(s), {$media} media file(s).");

        return self::SUCCESS;
    }
}

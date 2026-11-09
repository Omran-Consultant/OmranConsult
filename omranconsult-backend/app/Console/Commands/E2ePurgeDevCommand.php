<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Users\Infrastructure\Models\UserInvitation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class E2ePurgeDevCommand extends Command
{
    protected $signature = 'e2e:purge-dev';

    protected $description = 'Remove Playwright pollution from the development database (local only).';

    public function handle(): int
    {
        if (! app()->environment('local')) {
            $this->components->error('e2e:purge-dev is only available when APP_ENV is local.');

            return self::FAILURE;
        }

        $connection = (string) config('database.default');
        $activeDatabase = (string) config("database.connections.{$connection}.database");
        if ($activeDatabase === (string) config('e2e.database')) {
            $this->components->error('Refusing to purge the isolated E2E database. Point DB_DATABASE at the dev database.');

            return self::FAILURE;
        }

        $removed = [
            'users' => 0,
            'invitations' => 0,
            'drafts' => 0,
            'titles_reset' => 0,
        ];

        $adminEmail = strtolower(trim((string) env('E2E_ADMIN_EMAIL', 'e2e-admin@omran.test')));

        DB::transaction(function () use (&$removed, $adminEmail): void {
            $removed['users'] = User::query()
                ->where(function ($query) use ($adminEmail): void {
                    $query->where('email', 'like', 'e2e-%@omran.test')
                        ->orWhere('email', $adminEmail)
                        ->orWhere('email', 'e2e-editor@omran.test');
                })
                ->delete();

            $removed['invitations'] = UserInvitation::query()
                ->where(function ($query) use ($adminEmail): void {
                    $query->where('email', 'like', 'e2e-%@omran.test')
                        ->orWhere('email', $adminEmail)
                        ->orWhere('email', 'e2e-editor@omran.test');
                })
                ->delete();

            $removed['drafts'] = ContentDraft::query()->delete();

            Project::query()->each(function (Project $project) use (&$removed): void {
                $title = $project->title ?? [];
                if (! is_array($title)) {
                    return;
                }
                $ar = (string) ($title['ar'] ?? '');
                if ($ar === '' || ! str_contains($ar, 'مسودة-e2e')) {
                    return;
                }
                $title['ar'] = trim(str_replace('مسودة-e2e', '', str_replace(' مسودة-e2e', '', $ar)));
                $project->forceFill(['title' => $title])->save();
                $removed['titles_reset']++;
            });
        });

        $this->components->info(sprintf(
            'Purged dev DB: %d E2E user(s), %d invitation(s), %d draft(s), %d project title touch(es).',
            $removed['users'],
            $removed['invitations'],
            $removed['drafts'],
            $removed['titles_reset'],
        ));

        return self::SUCCESS;
    }
}

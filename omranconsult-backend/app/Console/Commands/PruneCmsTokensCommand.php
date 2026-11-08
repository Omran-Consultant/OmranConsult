<?php

namespace App\Console\Commands;

use App\Modules\Content\Infrastructure\Models\PreviewToken;
use App\Modules\Users\Infrastructure\Models\UserInvitation;
use Illuminate\Console\Command;

class PruneCmsTokensCommand extends Command
{
    protected $signature = 'cms:prune-tokens';

    protected $description = 'Delete expired preview tokens and stale invitations.';

    public function handle(): int
    {
        $tokens = PreviewToken::query()->where('expires_at', '<', now())->delete();
        $invites = UserInvitation::query()
            ->whereNull('accepted_at')
            ->where('expires_at', '<', now()->subDays(30))
            ->delete();

        $this->components->info("Pruned {$tokens} preview tokens and {$invites} invitations.");

        return self::SUCCESS;
    }
}

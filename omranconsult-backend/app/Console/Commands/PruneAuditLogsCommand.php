<?php

namespace App\Console\Commands;

use App\Modules\Audit\Infrastructure\Models\AuditLog;
use Illuminate\Console\Command;

class PruneAuditLogsCommand extends Command
{
    protected $signature = 'audit:prune';

    protected $description = 'Delete audit log rows older than 24 months.';

    public function handle(): int
    {
        $deleted = AuditLog::query()
            ->where('occurred_at', '<', now()->subMonthsNoOverflow(24))
            ->delete();

        $this->components->info("Pruned {$deleted} audit log rows.");

        return self::SUCCESS;
    }
}

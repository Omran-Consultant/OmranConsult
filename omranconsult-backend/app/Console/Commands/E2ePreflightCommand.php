<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class E2ePreflightCommand extends Command
{
    protected $signature = 'e2e:preflight';

    protected $description = 'Verify MySQL connectivity before Playwright E2E (local and testing only).';

    public function handle(): int
    {
        if (! app()->environment('local', 'testing')) {
            $this->components->error('e2e:preflight is only available when APP_ENV is local or testing.');

            return self::FAILURE;
        }

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $exception) {
            $this->components->error(
                'MySQL is not reachable. شغّل MAMP MySQL على المنفذ 8889 ثم أعد المحاولة.'
            );
            $this->line($exception->getMessage());

            return self::FAILURE;
        }

        $this->components->info('MySQL OK.');

        return self::SUCCESS;
    }
}

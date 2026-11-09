<?php

namespace App\Console\Commands;

use App\Support\E2e\E2eHarness;
use Illuminate\Console\Command;

class E2eDisarmHarnessCommand extends Command
{
    protected $signature = 'e2e:disarm-harness';

    protected $description = 'Clear Playwright E2E harness flags (local and testing only).';

    public function handle(): int
    {
        if (! app()->environment('local', 'testing')) {
            $this->components->error('e2e:disarm-harness is only available when APP_ENV is local or testing.');

            return self::FAILURE;
        }

        E2eHarness::disarm();
        $this->components->info('E2E harness disarmed.');

        return self::SUCCESS;
    }
}

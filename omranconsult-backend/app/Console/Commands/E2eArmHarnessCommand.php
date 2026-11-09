<?php

namespace App\Console\Commands;

use App\Support\E2e\E2eHarness;
use Illuminate\Console\Command;

class E2eArmHarnessCommand extends Command
{
    protected $signature = 'e2e:arm-harness {--frontend-url=}';

    protected $description = 'Mark this API instance for Playwright E2E (sync queue, local only).';

    public function handle(): int
    {
        if (! app()->environment('local', 'testing')) {
            $this->components->error('e2e:arm-harness is only available when APP_ENV is local or testing.');

            return self::FAILURE;
        }

        $frontendUrl = $this->option('frontend-url');
        E2eHarness::arm(is_string($frontendUrl) ? $frontendUrl : null);
        $this->components->info('E2E harness armed (sync queue for this API).');

        return self::SUCCESS;
    }
}

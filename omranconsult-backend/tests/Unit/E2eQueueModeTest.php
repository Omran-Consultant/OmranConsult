<?php

namespace Tests\Unit;

use App\Support\E2e\E2eQueueMode;
use Tests\TestCase;

class E2eQueueModeTest extends TestCase
{
    public function test_omran_e2e_is_ignored_outside_local_and_testing(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        putenv('OMRAN_E2E=1');

        $this->assertFalse(E2eQueueMode::shouldUseSync());

        putenv('OMRAN_E2E');
    }
}

<?php

namespace Tests\Unit;

use App\Support\E2e\E2eHarness;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AppE2eHarnessConfigTest extends TestCase
{
    protected function tearDown(): void
    {
        E2eHarness::disarm();

        parent::tearDown();
    }

    public function test_armed_harness_forces_sync_queue_in_local(): void
    {
        Cache::flush();
        config(['queue.default' => 'database']);
        $this->app->detectEnvironment(fn () => 'local');
        E2eHarness::arm();
        $this->refreshApplication();

        $this->assertSame('sync', config('queue.default'));
    }
}

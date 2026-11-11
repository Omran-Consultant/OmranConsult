<?php

namespace Tests\Feature\Console;

use App\Support\E2e\E2eHarness;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class E2eArmHarnessCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        E2eHarness::disarm();

        parent::tearDown();
    }

    public function test_arm_harness_sets_sync_queue_flag(): void
    {
        $this->assertFalse(E2eHarness::isArmed());

        $this->artisan('e2e:arm-harness')
            ->assertSuccessful()
            ->expectsOutputToContain('E2E harness armed');

        $this->assertTrue(E2eHarness::isArmed());

        $this->getJson('/api/e2e/preflight')
            ->assertOk()
            ->assertJsonPath('queue', 'sync');
    }
}

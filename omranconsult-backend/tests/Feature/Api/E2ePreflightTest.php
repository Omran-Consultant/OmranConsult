<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class E2ePreflightTest extends TestCase
{
    use RefreshDatabase;

    public function test_preflight_reports_database_and_sync_queue_in_testing(): void
    {
        config(['queue.default' => 'sync']);

        $this->getJson('/api/e2e/preflight')
            ->assertOk()
            ->assertJsonPath('database', 'ok')
            ->assertJsonPath('queue', 'sync');
    }
}

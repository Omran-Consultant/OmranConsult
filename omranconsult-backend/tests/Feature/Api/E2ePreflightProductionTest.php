<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class E2ePreflightProductionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->detectEnvironment(fn () => 'production');
    }

    public function test_preflight_is_not_available_in_production(): void
    {
        $this->getJson('/api/e2e/preflight')->assertNotFound();
    }
}

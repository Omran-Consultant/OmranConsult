<?php

namespace Tests\Feature\Console;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class E2ePreflightCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_preflight_succeeds_when_database_is_available(): void
    {
        $this->artisan('e2e:preflight')
            ->assertSuccessful()
            ->expectsOutputToContain('MySQL OK.');
    }
}

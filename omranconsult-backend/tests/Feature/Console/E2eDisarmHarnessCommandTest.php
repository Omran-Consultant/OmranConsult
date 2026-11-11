<?php

namespace Tests\Feature\Console;

use App\Support\E2e\E2eHarness;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class E2eDisarmHarnessCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        E2eHarness::disarm();

        parent::tearDown();
    }

    /**
     * An armed API boots on the E2E database (AppServiceProvider). With the flags in the database
     * cache, disarm then deleted them from the E2E database and the dev API stayed armed.
     */
    public function test_disarm_clears_the_flags_after_the_default_connection_moved(): void
    {
        config(['cache.default' => 'database']);
        $this->artisan('e2e:arm-harness')->assertSuccessful();
        $this->assertTrue(E2eHarness::usesIsolatedDatabase());

        $original = config('database.default');
        config([
            'database.connections.e2e_swap' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''],
            'database.default' => 'e2e_swap',
        ]);
        DB::purge('e2e_swap');
        // A new artisan process resolves its cache stores after that switch.
        app('cache')->forgetDriver('database');

        $this->artisan('e2e:disarm-harness')->assertSuccessful();

        config(['database.default' => $original]);
        app('cache')->forgetDriver('database');
        $this->assertFalse(E2eHarness::isArmed());
        $this->assertFalse(E2eHarness::usesIsolatedDatabase());
        $this->assertNull(E2eHarness::frontendUrl());
    }
}

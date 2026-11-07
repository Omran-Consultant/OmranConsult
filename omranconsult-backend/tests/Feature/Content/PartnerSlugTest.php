<?php

namespace Tests\Feature\Content;

use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerSlugTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    public function test_partners_expose_stable_slugs(): void
    {
        $response = $this->getJson('/api/partners')->assertOk();

        $this->assertSame(
            ['oliver-wyman', 'musanadah', 'tacent', 'bureau-veritas'],
            collect($response->json('data'))->pluck('slug')->all(),
        );
    }
}

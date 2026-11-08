<?php

namespace Tests\Feature\Api;

use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiSecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_health_and_content_responses_have_security_headers(): void
    {
        $this->seed(ProfileContentSeeder::class);

        foreach (['/api/health', '/api/home'] as $path) {
            $this->getJson($path)
                ->assertOk()
                ->assertHeader('X-Content-Type-Options', 'nosniff')
                ->assertHeader('X-Frame-Options', 'DENY')
                ->assertHeader('Referrer-Policy', 'no-referrer')
                ->assertHeader('Cross-Origin-Resource-Policy', 'same-site')
                ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        }
    }
}

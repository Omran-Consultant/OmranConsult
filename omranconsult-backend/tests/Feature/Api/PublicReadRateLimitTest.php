<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class PublicReadRateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('services.frontend.server_key', '');
    }

    protected function tearDown(): void
    {
        RateLimiter::clear('public-read|198.51.100.20');
        RateLimiter::clear('public-read|198.51.100.21');
        RateLimiter::clear('public-read|198.51.100.22');
        RateLimiter::clear('public-read|198.51.100.23');
        RateLimiter::clear('public-read|198.51.100.24');
        RateLimiter::clear('public-read|198.51.100.25');

        parent::tearDown();
    }

    public function test_public_read_returns_too_many_requests_after_120_requests_per_ip(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.20']);

        for ($request = 1; $request <= 120; $request++) {
            $this->getJson('/api/partners')->assertOk();
        }

        $this->getJson('/api/partners')->assertTooManyRequests();
    }

    public function test_trusted_frontend_server_ip_is_not_limited(): void
    {
        config()->set('security.public_read_trusted_ips', ['198.51.100.21']);
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.21']);

        for ($request = 1; $request <= 121; $request++) {
            $this->getJson('/api/partners')->assertOk();
        }
    }

    public function test_health_is_not_subject_to_the_public_read_limit(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.20']);

        for ($request = 1; $request <= 121; $request++) {
            $this->getJson('/api/health')->assertOk();
        }
    }

    public function test_matching_frontend_key_bypasses_the_public_read_limit(): void
    {
        config()->set('services.frontend.server_key', 'omran-frontend-secret');
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.22']);

        $this->withHeaders(['X-Omran-Frontend-Key' => 'omran-frontend-secret']);

        for ($request = 1; $request <= 121; $request++) {
            $this->getJson('/api/partners')->assertOk();
        }
    }

    public function test_wrong_frontend_key_is_limited(): void
    {
        config()->set('services.frontend.server_key', 'omran-frontend-secret');
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.23']);
        $this->withHeaders(['X-Omran-Frontend-Key' => 'wrong-key']);

        for ($request = 1; $request <= 120; $request++) {
            $this->getJson('/api/partners')->assertOk();
        }

        $this->getJson('/api/partners')->assertTooManyRequests();
    }

    public function test_missing_frontend_key_is_limited_when_a_key_is_configured(): void
    {
        config()->set('services.frontend.server_key', 'omran-frontend-secret');
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.24']);

        for ($request = 1; $request <= 120; $request++) {
            $this->getJson('/api/partners')->assertOk();
        }

        $this->getJson('/api/partners')->assertTooManyRequests();
    }

    public function test_empty_configured_key_does_not_bypass_even_with_header(): void
    {
        config()->set('services.frontend.server_key', '');
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.25']);
        $this->withHeaders(['X-Omran-Frontend-Key' => 'anything']);

        for ($request = 1; $request <= 120; $request++) {
            $this->getJson('/api/partners')->assertOk();
        }

        $this->getJson('/api/partners')->assertTooManyRequests();
    }
}

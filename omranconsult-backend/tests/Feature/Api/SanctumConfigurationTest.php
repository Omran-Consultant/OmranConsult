<?php

namespace Tests\Feature\Api;

use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Tests\TestCase;

class SanctumConfigurationTest extends TestCase
{
    public function test_sanctum_csrf_cookie_route_is_registered(): void
    {
        $response = $this->get('/sanctum/csrf-cookie');

        $response->assertNoContent();
        $response->assertCookie('XSRF-TOKEN');
    }

    public function test_api_middleware_group_includes_sanctum_stateful_middleware(): void
    {
        $apiMiddleware = app('router')->getMiddlewareGroups()['api'] ?? [];

        $this->assertContains(EnsureFrontendRequestsAreStateful::class, $apiMiddleware);
    }

    public function test_cors_allows_configured_frontend_origin_with_credentials(): void
    {
        $this->assertTrue(config('cors.supports_credentials'));
        $this->assertSame(
            ['http://localhost:3000'],
            config('cors.allowed_origins')
        );
    }
}

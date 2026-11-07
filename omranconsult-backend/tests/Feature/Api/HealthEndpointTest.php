<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_api_health_returns_ok_json(): void
    {
        $response = $this->getJson('/api/health');

        $response
            ->assertOk()
            ->assertExactJson(['status' => 'ok']);
    }

    public function test_unknown_api_route_returns_json_not_found(): void
    {
        $response = $this->getJson('/api/unknown-endpoint');

        $response->assertNotFound();
    }
}

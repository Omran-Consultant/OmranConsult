<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class ApplicationHealthTest extends TestCase
{
    public function test_up_health_route_is_available(): void
    {
        $response = $this->get('/up');

        $response->assertOk();
    }
}

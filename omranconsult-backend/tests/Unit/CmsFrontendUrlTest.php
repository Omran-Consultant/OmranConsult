<?php

namespace Tests\Unit;

use App\Support\Cms\CmsFrontendUrl;
use App\Support\E2e\E2eHarness;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CmsFrontendUrlTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        E2eHarness::disarm();
    }

    public function test_armed_harness_uses_override_frontend_url_for_revalidation(): void
    {
        config(['cms.frontend_url' => 'http://localhost:3000']);
        E2eHarness::arm('http://localhost:3010');

        $this->assertSame('http://localhost:3010', CmsFrontendUrl::forRevalidation());
    }

    public function test_disarmed_harness_keeps_configured_frontend_url(): void
    {
        config(['cms.frontend_url' => 'http://localhost:3000']);

        $this->assertSame('http://localhost:3000', CmsFrontendUrl::forRevalidation());
    }
}

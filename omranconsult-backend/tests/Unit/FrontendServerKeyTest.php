<?php

namespace Tests\Unit;

use App\Support\FrontendServerKey;
use Tests\TestCase;

class FrontendServerKeyTest extends TestCase
{
    public function test_empty_configured_key_never_matches(): void
    {
        config()->set('services.frontend.server_key', '');

        $this->assertFalse(FrontendServerKey::matches('anything'));
        $this->assertFalse(FrontendServerKey::matches(''));
        $this->assertFalse(FrontendServerKey::matches(null));
    }

    public function test_matching_key_uses_hash_equals(): void
    {
        config()->set('services.frontend.server_key', 'omran-frontend-secret');

        $this->assertTrue(FrontendServerKey::matches('omran-frontend-secret'));
        $this->assertTrue(hash_equals('omran-frontend-secret', 'omran-frontend-secret'));
        $this->assertFalse(FrontendServerKey::matches('omran-frontend-secre'));
        $this->assertFalse(FrontendServerKey::matches('omran-frontend-secret-extra'));
        $this->assertFalse(FrontendServerKey::matches('wrong'));
        $this->assertFalse(FrontendServerKey::matches(''));
        $this->assertFalse(FrontendServerKey::matches(null));
    }
}

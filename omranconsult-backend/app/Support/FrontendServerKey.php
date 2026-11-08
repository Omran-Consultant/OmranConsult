<?php

namespace App\Support;

/**
 * Shared secret sent by the Next.js server as `X-Omran-Frontend-Key`.
 * Compared with hash_equals. An empty configured key never matches.
 */
final class FrontendServerKey
{
    public static function matches(?string $provided): bool
    {
        $expected = (string) config('services.frontend.server_key');
        if ($expected === '' || $provided === null || $provided === '') {
            return false;
        }

        return hash_equals($expected, $provided);
    }
}

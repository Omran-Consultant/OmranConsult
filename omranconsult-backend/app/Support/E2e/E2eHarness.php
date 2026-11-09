<?php

namespace App\Support\E2e;

use Illuminate\Support\Facades\Cache;

final class E2eHarness
{
    private const CACHE_KEY = 'e2e:sync_queue';

    public static function arm(): void
    {
        Cache::put(self::CACHE_KEY, true, now()->addHours(3));
    }

    public static function isArmed(): bool
    {
        return (bool) Cache::get(self::CACHE_KEY);
    }
}

<?php

namespace App\Support\E2e;

use Illuminate\Support\Facades\Cache;

final class E2eHarness
{
    private const CACHE_KEY = 'e2e:sync_queue';

    private const DB_KEY = 'e2e:isolated_database';

    public static function arm(): void
    {
        Cache::put(self::CACHE_KEY, true, now()->addMinutes(30));
        Cache::put(self::DB_KEY, true, now()->addMinutes(30));
    }

    public static function disarm(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::DB_KEY);
    }

    public static function isArmed(): bool
    {
        return (bool) Cache::get(self::CACHE_KEY);
    }

    public static function usesIsolatedDatabase(): bool
    {
        return (bool) Cache::get(self::DB_KEY);
    }
}

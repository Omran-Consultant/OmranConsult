<?php

namespace App\Support\E2e;

use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

final class E2eHarness
{
    private const CACHE_KEY = 'e2e:sync_queue';

    private const DB_KEY = 'e2e:isolated_database';

    private const FRONTEND_KEY = 'e2e:frontend_url';

    public static function arm(?string $frontendUrl = null): void
    {
        self::store()->put(self::CACHE_KEY, true, now()->addMinutes(30));
        self::store()->put(self::DB_KEY, true, now()->addMinutes(30));
        if (is_string($frontendUrl) && $frontendUrl !== '') {
            self::store()->put(self::FRONTEND_KEY, rtrim($frontendUrl, '/'), now()->addMinutes(30));
        }
    }

    public static function disarm(): void
    {
        self::store()->forget(self::CACHE_KEY);
        self::store()->forget(self::DB_KEY);
        self::store()->forget(self::FRONTEND_KEY);
    }

    public static function isArmed(): bool
    {
        return (bool) self::store()->get(self::CACHE_KEY);
    }

    public static function usesIsolatedDatabase(): bool
    {
        return (bool) self::store()->get(self::DB_KEY);
    }

    public static function frontendUrl(): ?string
    {
        $url = self::store()->get(self::FRONTEND_KEY);

        return is_string($url) && $url !== '' ? rtrim($url, '/') : null;
    }

    /**
     * Never the default store: once armed, the default database connection is the E2E database,
     * so database-cache flags written before arming could not be cleared afterwards.
     */
    private static function store(): Repository
    {
        return Cache::store('e2e');
    }
}

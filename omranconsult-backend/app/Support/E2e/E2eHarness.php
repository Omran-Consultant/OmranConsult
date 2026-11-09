<?php

namespace App\Support\E2e;

use Illuminate\Support\Facades\Cache;

final class E2eHarness
{
    private const CACHE_KEY = 'e2e:sync_queue';

    private const DB_KEY = 'e2e:isolated_database';

    private const FRONTEND_KEY = 'e2e:frontend_url';

    public static function arm(?string $frontendUrl = null): void
    {
        Cache::put(self::CACHE_KEY, true, now()->addMinutes(30));
        Cache::put(self::DB_KEY, true, now()->addMinutes(30));
        if (is_string($frontendUrl) && $frontendUrl !== '') {
            Cache::put(self::FRONTEND_KEY, rtrim($frontendUrl, '/'), now()->addMinutes(30));
        }
    }

    public static function disarm(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::DB_KEY);
        Cache::forget(self::FRONTEND_KEY);
    }

    public static function isArmed(): bool
    {
        return (bool) Cache::get(self::CACHE_KEY);
    }

    public static function usesIsolatedDatabase(): bool
    {
        return (bool) Cache::get(self::DB_KEY);
    }

    public static function frontendUrl(): ?string
    {
        $url = Cache::get(self::FRONTEND_KEY);

        return is_string($url) && $url !== '' ? rtrim($url, '/') : null;
    }
}

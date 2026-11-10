<?php

namespace App\Modules\Media\Application;

use App\Modules\Media\Infrastructure\Models\Media;
use Illuminate\Support\Facades\Storage;

final class MediaUrls
{
    public static function url(Media $media, ?string $path = null): string
    {
        $stored = $path ?? $media->path;
        if ($media->disk === 'site' || $path !== null && self::isSitePath($stored)) {
            return '/'.ltrim($stored, '/');
        }

        $url = Storage::disk('public')->url($stored);
        $parsed = parse_url($url, PHP_URL_PATH);

        return is_string($parsed) && $parsed !== '' ? $parsed : $url;
    }

    public static function srcset(Media $media): ?string
    {
        $variants = $media->variants ?? [];
        if (! is_array($variants) || $variants === []) {
            return null;
        }

        $parts = [];
        foreach ($variants as $width => $path) {
            if (! is_string($path) || $path === '') {
                continue;
            }
            $parts[] = self::url($media, $path).' '.(int) $width.'w';
        }

        if (is_int($media->width) && $media->width > 0) {
            $parts[] = self::url($media).' '.$media->width.'w';
        }

        return $parts === [] ? null : implode(', ', $parts);
    }

    private static function isSitePath(string $path): bool
    {
        return str_starts_with(ltrim($path, '/'), 'images/');
    }
}

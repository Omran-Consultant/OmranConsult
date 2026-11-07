<?php

namespace App\Support\Content;

use Illuminate\Http\Request;

/**
 * Public API locale resolution (backend CLAUDE.md "API contract", SDD §6.3).
 * Missing or unsupported Accept-Language resolves to English. No cross-locale fallback.
 */
final class PublicLocale
{
    public const SUPPORTED = ['en', 'ar'];

    public const DEFAULT = 'en';

    public static function fromRequest(Request $request): string
    {
        return $request->getPreferredLanguage(self::SUPPORTED) ?? self::DEFAULT;
    }

    /**
     * Resolve one translation map ({"ar": ..., "en": ...}) to the requested locale.
     *
     * @param  array<string, mixed>|null  $map
     */
    public static function pick(?array $map, ?string $locale = null): ?string
    {
        $value = $map[$locale ?? app()->getLocale()] ?? null;

        return is_string($value) && $value !== '' ? $value : null;
    }

    /**
     * Resolve every translation map inside a nested payload (content blocks, settings).
     */
    public static function resolveTree(mixed $value, ?string $locale = null): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if (self::isTranslationMap($value)) {
            return self::pick($value, $locale);
        }

        return array_map(fn (mixed $item): mixed => self::resolveTree($item, $locale), $value);
    }

    /**
     * @param  array<array-key, mixed>  $value
     */
    private static function isTranslationMap(array $value): bool
    {
        $keys = array_keys($value);
        sort($keys);

        return $keys === ['ar', 'en']
            && (is_string($value['ar']) || $value['ar'] === null)
            && (is_string($value['en']) || $value['en'] === null);
    }
}

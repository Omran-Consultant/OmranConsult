<?php

namespace App\Modules\Content\Application;

use App\Support\Content\SemanticIcons;

/**
 * Structure rule for editing a seeded content block (PHASE5B 5B-3a): the dashboard changes the text
 * of a block, not its shape. A submitted payload must mirror the live payload — the same keys, a
 * translation map where the live one has a translation map, a list where it has a list — because
 * the public pages read these payloads by key. List items follow the shape of the live list's first
 * item, so an editor can add, remove or reorder items of a list without inventing fields.
 */
final class BlockPayloadShape
{
    public const MAX_TEXT = 5000;

    public const MAX_SCALAR = 500;

    public const MAX_ITEMS = 40;

    /**
     * @return array<string, list<string>> field path => error codes (empty when the payload fits)
     */
    public static function errors(mixed $live, mixed $candidate): array
    {
        $errors = [];
        self::walk($live, $candidate, 'payload', null, $errors);

        return $errors;
    }

    /**
     * Paths of translation maps filled in one locale only (publish gate, Q13).
     *
     * @return list<string>
     */
    public static function halfTranslated(mixed $payload, string $path = 'payload'): array
    {
        if (! is_array($payload)) {
            return [];
        }

        if (self::isTranslationMap($payload)) {
            $filled = array_map(fn (mixed $value): bool => is_string($value) && trim($value) !== '', $payload);

            return $filled['ar'] === $filled['en'] ? [] : [$path];
        }

        $paths = [];
        foreach ($payload as $key => $child) {
            array_push($paths, ...self::halfTranslated($child, $path.'.'.$key));
        }

        return $paths;
    }

    /**
     * @param  array<string, list<string>>  $errors
     */
    private static function walk(mixed $live, mixed $candidate, string $path, ?string $key, array &$errors): void
    {
        if (! is_array($live)) {
            self::scalar($live, $candidate, $path, $key, $errors);

            return;
        }

        if (! is_array($candidate)) {
            $errors[$path][] = 'shape_mismatch';

            return;
        }

        if (self::isTranslationMap($live)) {
            self::translationMap($candidate, $path, $errors);

            return;
        }

        if (array_is_list($live)) {
            self::items($live, $candidate, $path, $errors);

            return;
        }

        $liveKeys = array_keys($live);
        $candidateKeys = array_keys($candidate);
        sort($liveKeys);
        sort($candidateKeys);
        if ($liveKeys !== $candidateKeys) {
            $errors[$path][] = 'shape_mismatch';

            return;
        }

        foreach ($live as $childKey => $child) {
            self::walk($child, $candidate[$childKey], $path.'.'.$childKey, (string) $childKey, $errors);
        }
    }

    /**
     * @param  array<string, list<string>>  $errors
     */
    private static function scalar(mixed $live, mixed $candidate, string $path, ?string $key, array &$errors): void
    {
        if (is_array($candidate) || gettype($live) !== gettype($candidate)) {
            $errors[$path][] = 'shape_mismatch';

            return;
        }

        if (! is_string($candidate)) {
            return;
        }

        if (mb_strlen($candidate) > self::MAX_SCALAR) {
            $errors[$path][] = 'too_long';
        }
        if ($key === 'icon' && $candidate !== $live && ! SemanticIcons::isAllowed($candidate)) {
            $errors[$path][] = 'invalid_icon';
        }
        // Internal links only: a site path or an in-page anchor, never a scheme or a protocol-relative URL.
        if ($key === 'href' && preg_match('~^(/(?!/)|#)[^\s]*$~', $candidate) !== 1) {
            $errors[$path][] = 'invalid_href';
        }
    }

    /**
     * @param  array<array-key, mixed>  $candidate
     * @param  array<string, list<string>>  $errors
     */
    private static function translationMap(array $candidate, string $path, array &$errors): void
    {
        $keys = array_keys($candidate);
        sort($keys);
        if ($keys !== ['ar', 'en']) {
            $errors[$path][] = 'shape_mismatch';

            return;
        }

        foreach (['ar', 'en'] as $locale) {
            $value = $candidate[$locale];
            if ($value !== null && ! is_string($value)) {
                $errors[$path.'.'.$locale][] = 'shape_mismatch';
            } elseif (is_string($value) && mb_strlen($value) > self::MAX_TEXT) {
                $errors[$path.'.'.$locale][] = 'too_long';
            }
        }
    }

    /**
     * @param  list<mixed>  $live
     * @param  array<array-key, mixed>  $candidate
     * @param  array<string, list<string>>  $errors
     */
    private static function items(array $live, array $candidate, string $path, array &$errors): void
    {
        if (! array_is_list($candidate)) {
            $errors[$path][] = 'shape_mismatch';

            return;
        }
        if ($live === []) {
            if ($candidate !== []) {
                $errors[$path][] = 'shape_mismatch';
            }

            return;
        }
        if ($candidate === []) {
            $errors[$path][] = 'items_required';

            return;
        }
        if (count($candidate) > self::MAX_ITEMS) {
            $errors[$path][] = 'too_many_items';

            return;
        }

        foreach ($candidate as $index => $item) {
            self::walk($live[0], $item, $path.'.'.$index, null, $errors);
        }
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

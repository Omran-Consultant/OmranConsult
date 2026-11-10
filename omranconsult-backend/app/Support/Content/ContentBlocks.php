<?php

namespace App\Support\Content;

use Illuminate\Validation\ValidationException;

/**
 * Structured rich text (Q1). No HTML is stored. Unknown types and marks are rejected on write.
 */
final class ContentBlocks
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function coerce(mixed $value): array
    {
        if (is_string($value)) {
            $text = trim($value);

            return $text === '' ? [] : [self::paragraph($text)];
        }

        if (! is_array($value)) {
            return [];
        }

        if (self::isLocaleMap($value)) {
            return [];
        }

        $blocks = [];
        foreach ($value as $block) {
            if (! is_array($block) || ! isset($block['type']) || ! is_string($block['type'])) {
                continue;
            }
            $normalized = self::coerceBlock($block);
            if ($normalized !== null) {
                $blocks[] = $normalized;
            }
        }

        return $blocks;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function validate(mixed $value, string $field, bool $allowImages = false): array
    {
        if ($value === null) {
            return [];
        }

        if (! is_array($value) || self::isLocaleMap($value)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        $blocks = [];
        foreach (array_values($value) as $index => $block) {
            if (! is_array($block)) {
                throw ValidationException::withMessages([$field => ['invalid_blocks']]);
            }
            $blocks[] = self::validateBlock($block, $field.'.'.$index, $allowImages);
        }

        return $blocks;
    }

    /**
     * @param  array<string, mixed>|null  $map
     * @return array{ar: list<array<string, mixed>>, en: list<array<string, mixed>>}
     */
    public static function validateLocaleMap(mixed $map, string $field, bool $allowImages = false): array
    {
        if (! is_array($map)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        return [
            'ar' => self::validate($map['ar'] ?? [], $field.'.ar', $allowImages),
            'en' => self::validate($map['en'] ?? [], $field.'.en', $allowImages),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $blocks
     */
    public static function hasVisibleText(array $blocks): bool
    {
        return trim(self::plainText($blocks)) !== '';
    }

    /**
     * @param  list<array<string, mixed>>  $blocks
     */
    public static function plainText(array $blocks): string
    {
        $parts = [];
        foreach ($blocks as $block) {
            if (($block['type'] ?? null) === 'list') {
                foreach ($block['items'] ?? [] as $item) {
                    $parts[] = self::childrenText(is_array($item) ? $item : []);
                }

                continue;
            }
            $parts[] = self::childrenText(is_array($block['children'] ?? null) ? $block['children'] : []);
        }

        return trim(implode("\n", array_filter($parts, fn (string $part): bool => $part !== '')));
    }

    /**
     * A single unmarked paragraph is rendered with the same subtitle element as the old string.
     *
     * @param  list<array<string, mixed>>  $blocks
     */
    public static function plainParagraph(array $blocks): ?string
    {
        if (count($blocks) !== 1 || ($blocks[0]['type'] ?? null) !== 'paragraph') {
            return null;
        }

        $children = $blocks[0]['children'] ?? [];
        if (! is_array($children) || count($children) !== 1) {
            return null;
        }

        $child = $children[0];
        if (! is_array($child) || self::hasMark($child)) {
            return null;
        }

        $text = trim((string) ($child['text'] ?? ''));

        return $text === '' ? null : $text;
    }

    /**
     * @return array{type: string, children: list<array{text: string}>}
     */
    public static function paragraph(string $text): array
    {
        return [
            'type' => 'paragraph',
            'children' => [['text' => $text]],
        ];
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<string, mixed>|null
     */
    private static function coerceBlock(array $block): ?array
    {
        $type = $block['type'];

        return match ($type) {
            'paragraph', 'quote' => [
                'type' => $type,
                'children' => self::coerceChildren($block['children'] ?? ($block['text'] ?? null)),
            ],
            'heading' => [
                'type' => 'heading',
                'level' => ($block['level'] ?? 'h2') === 'h3' ? 'h3' : 'h2',
                'children' => self::coerceChildren($block['children'] ?? ($block['text'] ?? null)),
            ],
            'list' => [
                'type' => 'list',
                'style' => ($block['style'] ?? 'bullet') === 'number' ? 'number' : 'bullet',
                'items' => self::coerceItems($block['items'] ?? []),
            ],
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<string, mixed>
     */
    private static function validateBlock(array $block, string $field, bool $allowImages): array
    {
        $type = $block['type'] ?? null;
        $allowed = ['type', 'children', 'level', 'style', 'items', 'media_id', 'alt'];
        if (array_diff(array_keys($block), $allowed) !== []) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        if ($type === 'image') {
            if (! $allowImages) {
                throw ValidationException::withMessages([$field => ['invalid_blocks']]);
            }

            return self::validateImage($block, $field);
        }

        if (! in_array($type, ['paragraph', 'heading', 'list', 'quote'], true)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        if ($type === 'list') {
            return [
                'type' => 'list',
                'style' => self::enumValue($block['style'] ?? null, ['bullet', 'number'], $field),
                'items' => self::validateItems($block['items'] ?? null, $field.'.items'),
            ];
        }

        $normalized = [
            'type' => $type,
            'children' => self::validateChildren($block['children'] ?? null, $field.'.children'),
        ];

        if ($type === 'heading') {
            $normalized['level'] = self::enumValue($block['level'] ?? null, ['h2', 'h3'], $field);
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<string, mixed>
     */
    private static function validateImage(array $block, string $field): array
    {
        $mediaId = $block['media_id'] ?? null;
        $alt = $block['alt'] ?? null;
        if (! is_int($mediaId) || ! is_array($alt)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        foreach (['ar', 'en'] as $locale) {
            if (! is_string($alt[$locale] ?? null) || trim($alt[$locale]) === '') {
                throw ValidationException::withMessages([$field => ['invalid_blocks']]);
            }
        }

        return [
            'type' => 'image',
            'media_id' => $mediaId,
            'alt' => ['ar' => trim($alt['ar']), 'en' => trim($alt['en'])],
        ];
    }

    /**
     * @return list<list<array<string, mixed>>>
     */
    private static function validateItems(mixed $items, string $field): array
    {
        if (! is_array($items)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        $normalized = [];
        foreach (array_values($items) as $index => $item) {
            $normalized[] = self::validateChildren($item, $field.'.'.$index);
        }

        return $normalized;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function validateChildren(mixed $children, string $field): array
    {
        if (! is_array($children)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        $normalized = [];
        foreach (array_values($children) as $index => $child) {
            $normalized[] = self::validateChild($child, $field.'.'.$index);
        }

        return $normalized;
    }

    /**
     * @return array<string, mixed>
     */
    private static function validateChild(mixed $child, string $field): array
    {
        if (! is_array($child)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        $text = $child['text'] ?? '';
        if ($text === null) {
            $text = '';
        }
        if (! is_string($text)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        $allowed = ['text', 'bold', 'italic', 'href'];
        if (array_diff(array_keys($child), $allowed) !== []) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        $node = ['text' => $text];
        foreach (['bold', 'italic'] as $mark) {
            if (! array_key_exists($mark, $child)) {
                continue;
            }
            if (! is_bool($child[$mark])) {
                throw ValidationException::withMessages([$field => ['invalid_blocks']]);
            }
            if ($child[$mark] === true) {
                $node[$mark] = true;
            }
        }

        if (array_key_exists('href', $child) && $child['href'] !== null && $child['href'] !== '') {
            if (! is_string($child['href']) || ! self::allowedHref($child['href'])) {
                throw ValidationException::withMessages([$field => ['invalid_blocks']]);
            }
            $node['href'] = $child['href'];
        }

        return $node;
    }

    /**
     * @param  list<mixed>  $allowed
     */
    private static function enumValue(mixed $value, array $allowed, string $field): string
    {
        if (! is_string($value) || ! in_array($value, $allowed, true)) {
            throw ValidationException::withMessages([$field => ['invalid_blocks']]);
        }

        return $value;
    }

    /**
     * @return list<array{text: string, bold?: bool, italic?: bool, href?: string}>
     */
    private static function coerceChildren(mixed $value): array
    {
        if (is_string($value)) {
            return [['text' => $value]];
        }

        if (! is_array($value)) {
            return [['text' => '']];
        }

        $children = [];
        foreach ($value as $child) {
            if (is_string($child)) {
                $children[] = ['text' => $child];

                continue;
            }
            if (! is_array($child) || ! is_string($child['text'] ?? null)) {
                continue;
            }
            $node = ['text' => $child['text']];
            if (($child['bold'] ?? false) === true) {
                $node['bold'] = true;
            }
            if (($child['italic'] ?? false) === true) {
                $node['italic'] = true;
            }
            if (is_string($child['href'] ?? null) && self::allowedHref($child['href'])) {
                $node['href'] = $child['href'];
            }
            $children[] = $node;
        }

        return $children === [] ? [['text' => '']] : $children;
    }

    /**
     * @return list<list<array{text: string}>>
     */
    private static function coerceItems(mixed $items): array
    {
        if (! is_array($items)) {
            return [[['text' => '']]];
        }

        $normalized = [];
        foreach ($items as $item) {
            $normalized[] = self::coerceChildren($item);
        }

        return $normalized === [] ? [[['text' => '']]] : $normalized;
    }

    /**
     * @param  list<array<string, mixed>>  $children
     */
    private static function childrenText(array $children): string
    {
        $text = '';
        foreach ($children as $child) {
            if (is_array($child)) {
                $text .= (string) ($child['text'] ?? '');
            }
        }

        return trim($text);
    }

    /**
     * @param  array<string, mixed>  $child
     */
    private static function hasMark(array $child): bool
    {
        return ($child['bold'] ?? false) === true
            || ($child['italic'] ?? false) === true
            || (is_string($child['href'] ?? null) && $child['href'] !== '');
    }

    private static function allowedHref(string $href): bool
    {
        if (str_starts_with($href, 'mailto:')) {
            return filter_var(substr($href, 7), FILTER_VALIDATE_EMAIL) !== false;
        }

        if (! str_starts_with($href, 'https://') && ! str_starts_with($href, 'http://')) {
            return false;
        }

        return filter_var($href, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * @param  array<mixed>  $value
     */
    private static function isLocaleMap(array $value): bool
    {
        $keys = array_keys($value);
        sort($keys);

        return $keys === ['ar', 'en'] || $keys === ['ar'] || $keys === ['en'];
    }
}

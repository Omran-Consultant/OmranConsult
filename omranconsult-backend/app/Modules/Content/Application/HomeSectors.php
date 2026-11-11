<?php

namespace App\Modules\Content\Application;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Support\Content\PublicationStatus;

/**
 * The ordered sector chips on Home (PHASE5 Q21). Stored as the `home` / `home_sectors` block
 * (`{ items: [sector slug, ...] }`), created the first time an editor publishes an order. Until
 * then the public site keeps its built-in five, which DEFAULT mirrors for the dashboard.
 */
final class HomeSectors
{
    public const SECTION_KEY = 'home_sectors';

    public const MAX = 5;

    public const DEFAULT = ['education', 'health', 'water-and-environment', 'infrastructure', 'universities'];

    public static function block(): ?ContentBlock
    {
        return ContentBlock::query()->where('page', 'home')->where('section_key', self::SECTION_KEY)->first();
    }

    /**
     * @return list<string>
     */
    public static function slugs(): array
    {
        $items = self::block()?->payload['items'] ?? null;

        return is_array($items) ? array_values(array_filter($items, 'is_string')) : self::DEFAULT;
    }

    /**
     * @param  list<string>  $slugs
     */
    public static function publish(array $slugs): ContentBlock
    {
        $block = self::block() ?? new ContentBlock([
            'page' => 'home',
            'section_key' => self::SECTION_KEY,
            'sort_order' => ((int) ContentBlock::withTrashed()->where('page', 'home')->max('sort_order')) + 1,
        ]);

        $block->fill([
            'payload' => ['items' => array_values($slugs)],
            'status' => PublicationStatus::Published,
            'published_at' => $block->published_at ?? now(),
        ])->save();

        return $block;
    }
}

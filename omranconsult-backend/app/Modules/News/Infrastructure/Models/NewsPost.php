<?php

namespace App\Modules\News\Infrastructure\Models;

use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * News post (SDD §6.7 P21). `is_demo` posts are seeded from the design and must be replaced or
 * unpublished before launch.
 */
#[Fillable([
    'slug', 'news_category_id', 'title', 'excerpt', 'body', 'cover_image', 'author', 'tags',
    'is_featured', 'is_demo', 'sort_order', 'status', 'published_at',
])]
class NewsPost extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'title' => 'array',
            'excerpt' => 'array',
            'body' => 'array',
            'author' => 'array',
            'tags' => 'array',
            'is_featured' => 'boolean',
            'is_demo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<NewsCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'news_category_id');
    }
}

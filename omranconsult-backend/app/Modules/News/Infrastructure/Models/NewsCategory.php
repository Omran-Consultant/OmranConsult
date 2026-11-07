<?php

namespace App\Modules\News\Infrastructure\Models;

use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'name', 'sort_order', 'status', 'published_at'])]
class NewsCategory extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'name' => 'array',
        ];
    }

    /**
     * @return HasMany<NewsPost, $this>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(NewsPost::class);
    }
}

<?php

namespace App\Modules\News\Presentation\Http\Resources;

use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * News list item (SDD §7.1). `date` is the publication day; publication fields stay internal.
 *
 * @mixin NewsPost
 */
class NewsPostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => PublicLocale::pick($this->title),
            'excerpt' => PublicLocale::pick($this->excerpt),
            'cover_image' => $this->cover_image,
            'category' => $this->category ? [
                'slug' => $this->category->slug,
                'name' => PublicLocale::pick($this->category->name),
            ] : null,
            'date' => $this->published_at?->toDateString(),
            'is_featured' => $this->is_featured,
            'is_demo' => $this->is_demo,
        ];
    }
}

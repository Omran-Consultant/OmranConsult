<?php

namespace App\Modules\News\Presentation\Http\Resources;

use App\Modules\Media\Application\MediaUrls;
use App\Modules\Media\Infrastructure\Models\Media;
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
        $cover = $this->coverMedia();

        return [
            'slug' => $this->slug,
            'title' => PublicLocale::pick($this->title),
            'excerpt' => PublicLocale::pick($this->excerpt),
            'cover_image' => $this->cover_image,
            'cover_url' => $cover['url'] ?? null,
            'cover_srcset' => $cover['srcset'] ?? null,
            'cover_width' => $cover['width'] ?? null,
            'cover_height' => $cover['height'] ?? null,
            'cover_alt' => $cover['alt'] ?? null,
            'category' => $this->category ? [
                'slug' => $this->category->slug,
                'name' => PublicLocale::pick($this->category->name),
            ] : null,
            'date' => $this->published_at?->toDateString(),
            'is_featured' => $this->is_featured,
            'is_demo' => $this->is_demo,
        ];
    }

    /**
     * @return array{url: ?string, srcset: ?string, width: ?int, height: ?int, alt: ?string}|null
     */
    protected function coverMedia(): ?array
    {
        if ($this->cover_media_id) {
            $media = Media::query()->find($this->cover_media_id);
            if ($media instanceof Media) {
                return [
                    'url' => MediaUrls::url($media),
                    'srcset' => MediaUrls::srcset($media),
                    'width' => $media->width,
                    'height' => $media->height,
                    'alt' => PublicLocale::pick(is_array($media->alt) ? $media->alt : null),
                ];
            }
        }

        return null;
    }
}

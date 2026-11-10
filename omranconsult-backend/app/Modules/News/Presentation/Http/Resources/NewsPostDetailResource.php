<?php

namespace App\Modules\News\Presentation\Http\Resources;

use App\Modules\Media\Application\MediaUrls;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Support\Content\ContentBlocks;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;

/**
 * GET /api/news/{slug}: list shape plus author, tags, body blocks and related posts (SDD §7.1).
 *
 * @mixin NewsPost
 */
class NewsPostDetailResource extends NewsPostResource
{
    /**
     * @param  iterable<int, NewsPost>  $related
     */
    public function __construct(NewsPost $resource, private readonly iterable $related = [])
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $seo = is_array($this->seo) ? $this->seo : [];

        return [
            ...parent::toArray($request),
            'author' => PublicLocale::pick($this->author),
            'tags' => PublicLocale::pickList($this->tags),
            'body' => $this->blocks(),
            'seo' => [
                'title' => PublicLocale::pick(is_array($seo['title'] ?? null) ? $seo['title'] : null),
                'description' => PublicLocale::pick(is_array($seo['description'] ?? null) ? $seo['description'] : null),
            ],
            'og_image' => $this->ogImage(),
            'related' => NewsPostResource::collection(collect($this->related))->resolve($request),
        ];
    }

    /**
     * Present body for the public renderer. Legacy `{type,text}` and ContentBlocks both work.
     *
     * @return list<array{type: string, text?: string, image?: string, media_id?: int, alt?: string|null}>
     */
    private function blocks(): array
    {
        $raw = $this->body[app()->getLocale()] ?? [];
        $blocks = ContentBlocks::coerce($raw);
        $resolved = [];

        foreach ($blocks as $block) {
            $type = $block['type'] ?? null;
            if ($type === 'image') {
                $image = $this->imageBlock($block);
                if ($image !== null) {
                    $resolved[] = $image;
                }

                continue;
            }
            if (! in_array($type, ['paragraph', 'heading', 'quote'], true)) {
                continue;
            }
            $text = ContentBlocks::plainText([$block]);
            if ($text === '') {
                continue;
            }
            $resolved[] = ['type' => $type, 'text' => $text];
        }

        return $resolved;
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array{type: string, image: string, media_id?: int, alt?: string|null}|null
     */
    private function imageBlock(array $block): ?array
    {
        $mediaId = (int) ($block['media_id'] ?? 0);
        if ($mediaId > 0) {
            $media = Media::query()->find($mediaId);
            if ($media instanceof Media) {
                return [
                    'type' => 'image',
                    'image' => MediaUrls::url($media) ?? '',
                    'media_id' => $mediaId,
                    'alt' => PublicLocale::pick(is_array($block['alt'] ?? null) ? $block['alt'] : (is_array($media->alt) ? $media->alt : null)),
                ];
            }
        }

        $key = is_string($block['key'] ?? null) ? $block['key'] : null;
        if ($key) {
            return ['type' => 'image', 'image' => $key];
        }

        return null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function ogImage(): ?array
    {
        if ($this->og_image_media_id === null) {
            return null;
        }
        $media = Media::query()->find($this->og_image_media_id);
        if (! $media instanceof Media) {
            return null;
        }

        return [
            'media_id' => $media->id,
            'url' => MediaUrls::url($media),
            'srcset' => MediaUrls::srcset($media),
            'width' => $media->width,
            'height' => $media->height,
            'alt' => PublicLocale::pick(is_array($media->alt) ? $media->alt : null),
        ];
    }
}

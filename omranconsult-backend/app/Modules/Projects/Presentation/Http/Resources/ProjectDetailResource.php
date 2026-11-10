<?php

namespace App\Modules\Projects\Presentation\Http\Resources;

use App\Modules\Media\Application\MediaUrls;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Projects\Application\ProjectGallery;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\ContentBlocks;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;

/**
 * GET /api/projects/{slug}: the list shape plus the optional facts and related projects (SDD P18).
 *
 * @mixin Project
 */
class ProjectDetailResource extends ProjectResource
{
    /**
     * @param  iterable<int, Project>  $related
     */
    public function __construct(Project $resource, private readonly iterable $related = [])
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'location' => PublicLocale::pick($this->location),
            'service_type' => PublicLocale::pick($this->service_type),
            'delivery_status' => $this->delivery_status?->value,
            'overview' => $this->publicOverview(),
            'scope' => PublicLocale::pickList($this->scope),
            'gallery' => ProjectGallery::present(ProjectGallery::stored($this->gallery), false),
            'seo' => [
                'title' => PublicLocale::pick(is_array($this->seo) ? ($this->seo['title'] ?? null) : null),
                'description' => PublicLocale::pick(is_array($this->seo) ? ($this->seo['description'] ?? null) : null),
            ],
            'og_image' => $this->ogImage(),
            'related' => ProjectResource::collection(collect($this->related))->resolve($request),
        ];
    }

    /**
     * @return list<array<string, mixed>>|null
     */
    private function publicOverview(): ?array
    {
        $map = is_array($this->overview) ? $this->overview : [];
        $blocks = ContentBlocks::coerce($map[app()->getLocale()] ?? null);

        return ContentBlocks::hasVisibleText($blocks) ? $blocks : null;
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

<?php

namespace App\Modules\Projects\Presentation\Http\Resources;

use App\Modules\Projects\Application\ProjectGallery;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
    /** @var array<string, mixed>|null */
    private ?array $coverCache = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => PublicLocale::pick($this->title),
            'client' => $this->client ? [
                'slug' => $this->client->slug,
                'name' => PublicLocale::pick($this->client->name),
            ] : null,
            'sector' => $this->sector ? [
                'slug' => $this->sector->slug,
                'name' => PublicLocale::pick($this->sector->name),
            ] : null,
            'year' => $this->year,
            'image' => $this->imageKey(),
            'image_url' => $this->coverMedia()['url'] ?? null,
            'image_srcset' => $this->coverMedia()['srcset'] ?? null,
            'image_width' => $this->coverMedia()['width'] ?? null,
            'image_height' => $this->coverMedia()['height'] ?? null,
            'image_alt' => $this->coverMedia()['alt'] ?? null,
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
            // Last change to the published row (owner-approved 2026-11-11): the sitemap's lastmod.
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    /**
     * @return array<string, mixed>
     */
    private function coverMedia(): array
    {
        if ($this->coverCache === null) {
            $this->coverCache = ProjectGallery::cover(ProjectGallery::stored($this->gallery)) ?? [];
        }

        return $this->coverCache;
    }
}

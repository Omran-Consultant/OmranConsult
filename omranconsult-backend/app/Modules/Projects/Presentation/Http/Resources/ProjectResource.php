<?php

namespace App\Modules\Projects\Presentation\Http\Resources;

use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
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
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
        ];
    }
}

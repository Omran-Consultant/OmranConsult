<?php

namespace App\Modules\Projects\Presentation\Http\Resources;

use App\Modules\Projects\Infrastructure\Models\Project;
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
            'overview' => PublicLocale::pick($this->overview),
            'scope' => PublicLocale::pickList($this->scope),
            'gallery' => array_values(array_filter($this->gallery ?? [], 'is_string')),
            'related' => ProjectResource::collection(collect($this->related))->resolve($request),
        ];
    }
}

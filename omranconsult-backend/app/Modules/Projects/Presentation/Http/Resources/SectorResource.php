<?php

namespace App\Modules\Projects\Presentation\Http\Resources;

use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Sector
 */
class SectorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => PublicLocale::pick($this->name),
            'projects_count' => $this->whenCounted('projects'),
        ];
    }
}

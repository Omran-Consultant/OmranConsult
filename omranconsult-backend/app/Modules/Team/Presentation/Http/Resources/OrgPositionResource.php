<?php

namespace App\Modules\Team\Presentation\Http\Resources;

use App\Modules\Team\Infrastructure\Models\OrgPosition;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OrgPosition
 */
class OrgPositionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'group' => $this->group->value,
            'title' => PublicLocale::pick($this->title),
            'person' => $this->member ? [
                'id' => $this->member->id,
                'slug' => $this->member->slug,
                'name' => PublicLocale::pick($this->member->name),
            ] : null,
        ];
    }
}

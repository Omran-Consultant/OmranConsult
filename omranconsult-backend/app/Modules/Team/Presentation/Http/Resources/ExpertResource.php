<?php

namespace App\Modules\Team\Presentation\Http\Resources;

use App\Modules\Team\Infrastructure\Models\TeamMember;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TeamMember
 */
class ExpertResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => PublicLocale::pick($this->name),
            'title' => PublicLocale::pick($this->title),
            'bio' => PublicLocale::pick($this->bio),
            'years_experience' => $this->years_experience,
        ];
    }
}

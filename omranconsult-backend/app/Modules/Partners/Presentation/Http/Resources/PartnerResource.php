<?php

namespace App\Modules\Partners\Presentation\Http\Resources;

use App\Modules\Partners\Infrastructure\Models\Partner;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Partner
 */
class PartnerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => PublicLocale::pick($this->name),
            'field' => PublicLocale::pick($this->field),
        ];
    }
}

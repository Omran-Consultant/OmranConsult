<?php

namespace App\Modules\Documents\Presentation\Http\Resources;

use App\Modules\Documents\Infrastructure\Models\Document;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Document
 */
class DocumentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind->value,
            'title' => PublicLocale::pick($this->title),
            'standard_code' => $this->standard_code,
            'issuer' => $this->issuer,
            'valid_from' => $this->valid_from?->toDateString(),
            'valid_until' => $this->valid_until?->toDateString(),
            'is_expired' => $this->isExpired(),
        ];
    }
}

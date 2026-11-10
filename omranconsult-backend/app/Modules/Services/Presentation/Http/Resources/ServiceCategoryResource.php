<?php

namespace App\Modules\Services\Presentation\Http\Resources;

use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ServiceCategory
 */
class ServiceCategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'kind' => $this->kind->value,
            'title' => PublicLocale::pick($this->title),
            'icon' => $this->icon,
            'services' => ServiceResource::collection($this->whenLoaded('services')),
        ];
    }
}

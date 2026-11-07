<?php

namespace App\Modules\Services\Presentation\Http\Resources;

use App\Modules\Services\Infrastructure\Models\Service;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Service
 */
class ServiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => PublicLocale::pick($this->title),
        ];
    }
}

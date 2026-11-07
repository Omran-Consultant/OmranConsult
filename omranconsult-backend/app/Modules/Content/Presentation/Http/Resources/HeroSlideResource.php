<?php

namespace App\Modules\Content\Presentation\Http\Resources;

use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin HeroSlide
 */
class HeroSlideResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'headline' => PublicLocale::pick($this->headline),
            'subline' => PublicLocale::pick($this->subline),
        ];
    }
}

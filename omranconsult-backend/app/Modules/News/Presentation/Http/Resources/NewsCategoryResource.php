<?php

namespace App\Modules\News\Presentation\Http\Resources;

use App\Modules\News\Infrastructure\Models\NewsCategory;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin NewsCategory
 */
class NewsCategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => PublicLocale::pick($this->name),
        ];
    }
}

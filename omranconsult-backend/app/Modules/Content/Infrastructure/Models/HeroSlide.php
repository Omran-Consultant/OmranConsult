<?php

namespace App\Modules\Content\Infrastructure\Models;

use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'headline', 'subline', 'sort_order', 'status', 'published_at'])]
class HeroSlide extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'headline' => 'array',
            'subline' => 'array',
        ];
    }
}

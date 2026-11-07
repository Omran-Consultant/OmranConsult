<?php

namespace App\Modules\Team\Infrastructure\Models;

use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['slug', 'name', 'title', 'bio', 'years_experience', 'is_expert', 'sort_order', 'status', 'published_at'])]
class TeamMember extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'name' => 'array',
            'title' => 'array',
            'bio' => 'array',
            'years_experience' => 'integer',
            'is_expert' => 'boolean',
        ];
    }
}

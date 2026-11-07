<?php

namespace App\Modules\Projects\Infrastructure\Models;

use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Project sector (SDD §6.7 P17). `default_image` is the image key used when a project has no gallery.
 */
#[Fillable(['slug', 'name', 'default_image', 'sort_order', 'status', 'published_at'])]
class Sector extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'name' => 'array',
        ];
    }

    /**
     * @return HasMany<Project, $this>
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}

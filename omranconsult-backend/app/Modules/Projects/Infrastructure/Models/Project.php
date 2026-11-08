<?php

namespace App\Modules\Projects\Infrastructure\Models;

use App\Modules\Projects\Domain\DeliveryStatus;
use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'slug', 'client_id', 'sector_id', 'title', 'year', 'location', 'service_type', 'delivery_status',
    'overview', 'scope', 'gallery', 'is_featured', 'featured_order', 'sort_order', 'status', 'published_at',
])]
class Project extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'title' => 'array',
            'year' => 'integer',
            'location' => 'array',
            'service_type' => 'array',
            'delivery_status' => DeliveryStatus::class,
            'overview' => 'array',
            'scope' => 'array',
            'gallery' => 'array',
            'is_featured' => 'boolean',
            'featured_order' => 'integer',
        ];
    }

    /**
     * Cover image key: the first gallery image, else the sector's default (SDD P18).
     */
    public function imageKey(): ?string
    {
        $first = $this->gallery[0] ?? null;

        return is_string($first) && $first !== '' ? $first : $this->sector?->default_image;
    }

    /**
     * Owning entity (SDD A20).
     *
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<Sector, $this>
     */
    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    /**
     * @return BelongsToMany<Region, $this>
     */
    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class);
    }
}

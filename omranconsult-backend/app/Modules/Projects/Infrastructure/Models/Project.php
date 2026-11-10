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
    'overview', 'scope', 'gallery', 'is_featured', 'featured_order', 'sort_order', 'seo', 'og_image_media_id',
    'status', 'published_at',
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
            'seo' => 'array',
            'og_image_media_id' => 'integer',
            'has_demo_content' => 'boolean',
        ];
    }

    /**
     * Cover image key: the first gallery image, else the sector's default (SDD P18).
     * A media-only cover has no legacy key; callers then use the media URL.
     */
    public function imageKey(): ?string
    {
        $first = $this->gallery[0] ?? null;
        if (is_string($first) && $first !== '') {
            return $first;
        }

        if (is_array($first)) {
            $key = $first['key'] ?? null;
            if (is_string($key) && $key !== '') {
                return $key;
            }

            if (($first['media_id'] ?? null) !== null) {
                return null;
            }
        }

        return $this->sector?->default_image;
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

<?php

namespace App\Modules\Projects\Infrastructure\Models;

use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['slug', 'client_id', 'title', 'sort_order', 'status', 'published_at'])]
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
        ];
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
     * @return BelongsToMany<Region, $this>
     */
    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class);
    }
}

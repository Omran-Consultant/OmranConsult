<?php

namespace App\Support\Content;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Draft/published lifecycle shared by CMS entities (SDD §6.3).
 * Public reads go through published(); soft-deleted rows are excluded by SoftDeletes.
 */
trait Publishable
{
    use SoftDeletes;

    public function initializePublishable(): void
    {
        $this->mergeCasts([
            'status' => PublicationStatus::class,
            'published_at' => 'datetime',
        ]);
    }

    /**
     * @param  Builder<static>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where($this->qualifyColumn('status'), PublicationStatus::Published->value);
    }
}

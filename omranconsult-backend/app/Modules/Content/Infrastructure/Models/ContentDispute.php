<?php

namespace App\Modules\Content\Infrastructure\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Editorial or technical integrity note on content (SDD §6.4).
 * Under A26, open disputes are recorded for review but do not hide content.
 * A null subject_id marks a note about a whole collection (subject_type) or,
 * with a null subject_type, about the whole site.
 */
#[Fillable([
    'dispute_class', 'subject_type', 'subject_id', 'field_path', 'issue_code',
    'description', 'reference_snapshot', 'status',
])]
class ContentDispute extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reference_snapshot' => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}

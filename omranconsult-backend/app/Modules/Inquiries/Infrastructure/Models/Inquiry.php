<?php

namespace App\Modules\Inquiries\Infrastructure\Models;

use App\Modules\Inquiries\Domain\InquirySource;
use App\Modules\Inquiries\Domain\InquiryStatus;
use App\Modules\Projects\Infrastructure\Models\Project;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A contact or project inquiry (SDD §6.7 P19). Operational inbox: not publishable.
 */
#[Fillable([
    'name', 'organisation', 'email', 'phone', 'service_type', 'message', 'consent',
    'source', 'project_id', 'locale', 'status', 'ip_hash',
])]
class Inquiry extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'consent' => 'boolean',
            'source' => InquirySource::class,
            'status' => InquiryStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}

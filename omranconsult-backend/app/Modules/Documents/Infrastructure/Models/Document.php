<?php

namespace App\Modules\Documents\Infrastructure\Models;

use App\Modules\Documents\Domain\DocumentKind;
use App\Support\Content\Publishable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['kind', 'title', 'standard_code', 'issuer', 'valid_from', 'valid_until', 'sort_order', 'status', 'published_at'])]
class Document extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => DocumentKind::class,
            'title' => 'array',
            'valid_from' => 'date',
            'valid_until' => 'date',
        ];
    }

    /**
     * Expiry is reported, not enforced: expired documents stay public (SDD A26).
     */
    public function isExpired(?CarbonInterface $today = null): bool
    {
        return $this->valid_until !== null
            && $this->valid_until->lt(($today ?? now())->startOfDay());
    }
}

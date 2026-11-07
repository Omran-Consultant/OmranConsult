<?php

namespace App\Modules\Content\Infrastructure\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Operational configuration, one row per stable key; not draft/published (SDD §6.2).
 */
#[Fillable(['key', 'value', 'updated_by'])]
class SiteSetting extends Model
{
    /**
     * Keys the public settings endpoint exposes (SDD §6.3.2).
     */
    public const PUBLIC_KEYS = ['company_legal_name', 'contact'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }
}

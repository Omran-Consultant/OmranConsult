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
     * Keys the public settings endpoint exposes as stored (SDD §6.3.2, P23).
     */
    public const PUBLIC_KEYS = ['company_legal_name', 'contact', 'working_hours'];

    /**
     * `{path}` of the downloadable profile on the public disk (P23). Exposed as `profile_pdf_url`.
     */
    public const PROFILE_PDF_KEY = 'profile_pdf';

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

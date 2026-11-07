<?php

namespace App\Modules\Content\Infrastructure\Models;

use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value', 'unit', 'suffix', 'scale', 'label', 'sort_order', 'status', 'published_at'])]
class Statistic extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'unit' => 'array',
            'label' => 'array',
        ];
    }
}

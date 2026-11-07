<?php

namespace App\Modules\Content\Presentation\Http\Resources;

use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Statistic
 */
class StatisticResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'value' => $this->numericValue(),
            'unit' => PublicLocale::pick($this->unit),
            'suffix' => $this->suffix,
            'scale' => $this->scale,
            'label' => PublicLocale::pick($this->label),
        ];
    }

    private function numericValue(): int|float
    {
        $value = (float) $this->value;

        return floor($value) === $value ? (int) $value : $value;
    }
}

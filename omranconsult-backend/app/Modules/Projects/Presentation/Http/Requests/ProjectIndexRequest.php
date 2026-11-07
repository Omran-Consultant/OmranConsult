<?php

namespace App\Modules\Projects\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectIndexRequest extends FormRequest
{
    public const DEFAULT_PER_PAGE = 12;

    public const MAX_PER_PAGE = 100;

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'client' => ['sometimes', 'string', 'max:255'],
            'region' => ['sometimes', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }
}

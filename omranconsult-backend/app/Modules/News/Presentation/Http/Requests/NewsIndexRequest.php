<?php

namespace App\Modules\News\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsIndexRequest extends FormRequest
{
    public const DEFAULT_PER_PAGE = 6;

    public const MAX_PER_PAGE = 50;

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'string', 'max:255'],
            // 1: featured posts only; 0: everything except featured posts.
            'featured' => ['sometimes', 'in:0,1'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }
}

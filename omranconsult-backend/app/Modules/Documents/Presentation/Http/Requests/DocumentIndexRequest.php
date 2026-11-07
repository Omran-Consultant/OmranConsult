<?php

namespace App\Modules\Documents\Presentation\Http\Requests;

use App\Modules\Documents\Domain\DocumentKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentIndexRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'kind' => ['sometimes', 'string', Rule::enum(DocumentKind::class)],
        ];
    }
}

<?php

namespace App\Modules\Newsletter\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/**
 * POST /api/newsletter (SDD §7.2). The form shows a consent sentence; the client sends consent=true.
 */
class SubscribeRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower(trim($this->input('email')))]);
        }
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:190'],
            'consent' => ['accepted'],
        ];
    }
}

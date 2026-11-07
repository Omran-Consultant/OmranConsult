<?php

namespace App\Modules\Inquiries\Presentation\Http\Requests;

use App\Modules\Inquiries\Domain\InquirySource;
use App\Support\Content\PublicationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * POST /api/inquiries (SDD §7.2). Spec validation: name and email required; Saudi mobile
 * 05XXXXXXXX or +9665XXXXXXXX; message ≤ 2000; consent required on the contact page.
 */
class StoreInquiryRequest extends FormRequest
{
    public const MESSAGE_MAX = 2000;

    public const PHONE_PATTERN = '/^(05\d{8}|\+9665\d{8})$/';

    protected function prepareForValidation(): void
    {
        $phone = $this->input('phone');

        if (is_string($phone)) {
            $phone = preg_replace('/[\s\-]/', '', $phone);
            $this->merge(['phone' => $phone === '' ? null : $phone]);
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'organisation' => ['nullable', 'string', 'max:160'],
            'email' => ['required', 'string', 'email:rfc', 'max:190'],
            'phone' => ['nullable', 'string', 'regex:'.self::PHONE_PATTERN],
            'service_type' => ['nullable', 'string', Rule::exists('service_categories', 'slug')
                ->where('status', PublicationStatus::Published->value)->whereNull('deleted_at')],
            'message' => ['nullable', 'string', 'max:'.self::MESSAGE_MAX],
            'consent' => ['nullable', 'boolean', 'accepted_if:source,'.InquirySource::Contact->value],
            'source' => ['required', Rule::enum(InquirySource::class)],
            'project_slug' => ['nullable', 'required_if:source,'.InquirySource::Project->value, 'string',
                Rule::exists('projects', 'slug')->where('status', PublicationStatus::Published->value)->whereNull('deleted_at')],
            // Honeypot: humans never see this field.
            'website' => ['nullable', 'string', 'max:255'],
        ];
    }
}

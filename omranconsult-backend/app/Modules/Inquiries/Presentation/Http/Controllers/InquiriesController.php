<?php

namespace App\Modules\Inquiries\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inquiries\Domain\InquirySource;
use App\Modules\Inquiries\Domain\InquiryStatus;
use App\Modules\Inquiries\Infrastructure\Models\Inquiry;
use App\Modules\Inquiries\Presentation\Http\Requests\StoreInquiryRequest;
use App\Modules\Projects\Infrastructure\Models\Project;
use Illuminate\Http\JsonResponse;

/**
 * POST /api/inquiries (SDD §7.2, P19). Throttled 5/min/IP. No email is sent yet (Phase 5).
 * Bodies are never logged.
 */
class InquiriesController extends Controller
{
    public function __invoke(StoreInquiryRequest $request): JsonResponse
    {
        // A filled honeypot gets the normal answer, so bots learn nothing; nothing is stored.
        if (filled($request->validated('website'))) {
            return $this->received();
        }

        $source = InquirySource::from($request->validated('source'));
        $projectSlug = $request->validated('project_slug');

        Inquiry::create([
            'name' => $request->validated('name'),
            'organisation' => $request->validated('organisation'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'service_type' => $request->validated('service_type'),
            'message' => $request->validated('message'),
            'consent' => (bool) $request->validated('consent'),
            'source' => $source,
            'project_id' => $source === InquirySource::Project && $projectSlug !== null
                ? Project::query()->published()->where('slug', $projectSlug)->value('id')
                : null,
            'locale' => app()->getLocale(),
            'status' => InquiryStatus::New,
            'ip_hash' => hash_hmac('sha256', (string) $request->ip(), (string) config('app.key')),
        ]);

        return $this->received();
    }

    private function received(): JsonResponse
    {
        return response()->json(['message' => __('public.inquiry_received')], 201);
    }
}

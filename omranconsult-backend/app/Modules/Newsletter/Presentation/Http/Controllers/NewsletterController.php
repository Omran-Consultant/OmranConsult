<?php

namespace App\Modules\Newsletter\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Newsletter\Infrastructure\Models\NewsletterSubscriber;
use App\Modules\Newsletter\Presentation\Http\Requests\SubscribeRequest;
use Illuminate\Http\JsonResponse;

/**
 * POST /api/newsletter (SDD §7.2, P20). Idempotent: a known email answers 200 with the same
 * message, so the response does not reveal more than the request already knows.
 */
class NewsletterController extends Controller
{
    public function __invoke(SubscribeRequest $request): JsonResponse
    {
        $subscriber = NewsletterSubscriber::query()->firstOrCreate(
            ['email' => $request->validated('email')],
            ['locale' => app()->getLocale(), 'consented_at' => now()],
        );

        return response()->json(
            ['message' => __('public.newsletter_subscribed')],
            $subscriber->wasRecentlyCreated ? 201 : 200,
        );
    }
}

<?php

namespace App\Modules\Content\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\SiteSetting;
use App\Support\Content\PublicLocale;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/settings — public site settings in the requested locale (SDD §7.1).
 */
class SettingsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $settings = SiteSetting::query()
            ->whereIn('key', SiteSetting::PUBLIC_KEYS)
            ->pluck('value', 'key');

        $data = [];
        foreach (SiteSetting::PUBLIC_KEYS as $key) {
            $data[$key] = PublicLocale::resolveTree($settings[$key] ?? null);
        }

        return response()->json([
            'locale' => app()->getLocale(),
            'data' => $data,
        ]);
    }
}

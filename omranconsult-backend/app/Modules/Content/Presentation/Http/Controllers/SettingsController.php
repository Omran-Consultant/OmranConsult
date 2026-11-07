<?php

namespace App\Modules\Content\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\SiteSetting;
use App\Support\Content\PublicLocale;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

/**
 * GET /api/settings — public site settings in the requested locale (SDD §7.1, P23).
 */
class SettingsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $settings = SiteSetting::query()
            ->whereIn('key', [...SiteSetting::PUBLIC_KEYS, SiteSetting::PROFILE_PDF_KEY])
            ->pluck('value', 'key');

        $data = [];
        foreach (SiteSetting::PUBLIC_KEYS as $key) {
            $data[$key] = PublicLocale::resolveTree($settings[$key] ?? null);
        }
        $data['profile_pdf_url'] = $this->profilePdfUrl($settings[SiteSetting::PROFILE_PDF_KEY]['path'] ?? null);

        return response()->json([
            'locale' => app()->getLocale(),
            'data' => $data,
        ]);
    }

    /**
     * URL from the storage API, or null when the file is missing (the download button hides).
     */
    private function profilePdfUrl(mixed $path): ?string
    {
        if (! is_string($path) || $path === '' || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}

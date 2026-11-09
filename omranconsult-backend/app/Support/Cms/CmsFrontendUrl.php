<?php

namespace App\Support\Cms;

use App\Support\E2e\E2eHarness;

final class CmsFrontendUrl
{
    public static function forRevalidation(): string
    {
        if (E2eHarness::isArmed()) {
            $override = E2eHarness::frontendUrl();
            if ($override !== null) {
                return $override;
            }
        }

        return rtrim((string) config('cms.frontend_url'), '/');
    }
}

<?php

namespace App\Support\E2e;

final class E2eQueueMode
{
    public static function shouldUseSync(): bool
    {
        if (! app()->environment('local', 'testing')) {
            return false;
        }

        $e2e = filter_var(getenv('OMRAN_E2E') ?: env('OMRAN_E2E'), FILTER_VALIDATE_BOOL);

        return $e2e || E2eHarness::isArmed();
    }
}

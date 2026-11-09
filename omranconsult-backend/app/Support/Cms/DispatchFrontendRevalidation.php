<?php

namespace App\Support\Cms;

use App\Jobs\RevalidateFrontendCache;
use App\Modules\Projects\Infrastructure\Models\Project;

final class DispatchFrontendRevalidation
{
    /**
     * @param  list<string>  $tags
     */
    public static function tags(array $tags): void
    {
        RevalidateFrontendCache::dispatch($tags)->afterCommit()->afterResponse();
    }

    public static function forProject(Project $project): void
    {
        self::tags(['projects', 'project:'.$project->slug, 'home']);
    }
}

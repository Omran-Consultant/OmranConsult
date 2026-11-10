<?php

namespace App\Support\Cms;

use App\Jobs\RevalidateFrontendCache;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\E2e\E2eHarness;

final class DispatchFrontendRevalidation
{
    /**
     * @param  list<string>  $tags
     */
    public static function tags(array $tags): void
    {
        $pending = RevalidateFrontendCache::dispatch($tags)->afterCommit();
        if (! E2eHarness::isArmed()) {
            $pending->afterResponse();
        }
    }

    public static function forProject(Project $project): void
    {
        self::tags(['projects', 'project:'.$project->slug, 'home']);
    }

    public static function forServices(): void
    {
        self::tags(['services', 'home', 'pages']);
    }

    public static function forNews(NewsPost $post): void
    {
        self::tags(['news', 'news:'.$post->slug, 'home']);
    }
}

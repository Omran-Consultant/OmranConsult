<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Modules\Projects\Presentation\Http\Resources\RegionResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/regions — project-map regions (SDD P14).
 */
class RegionsController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $regions = Region::query()
            ->published()
            ->withCount(['projects' => fn ($query) => $query->published()])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return RegionResource::collection($regions)->additional(['locale' => app()->getLocale()]);
    }
}

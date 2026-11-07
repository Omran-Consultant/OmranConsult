<?php

namespace App\Modules\Team\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Team\Infrastructure\Models\OrgPosition;
use App\Modules\Team\Presentation\Http\Resources\OrgPositionResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/org-chart — flat list of positions with parent links (SDD P12).
 */
class OrgChartController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $positions = OrgPosition::query()
            ->published()
            ->with(['member' => fn ($query) => $query->published()])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return OrgPositionResource::collection($positions)->additional(['locale' => app()->getLocale()]);
    }
}

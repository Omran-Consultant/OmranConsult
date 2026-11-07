<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Modules\Projects\Presentation\Http\Resources\SectorResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/sectors — project sectors with published project counts (SDD §7.1, P17).
 */
class SectorsController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $sectors = Sector::query()
            ->published()
            ->withCount(['projects' => fn ($query) => $query->published()])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return SectorResource::collection($sectors)->additional(['locale' => app()->getLocale()]);
    }
}

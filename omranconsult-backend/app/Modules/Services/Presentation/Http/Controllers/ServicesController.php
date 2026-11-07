<?php

namespace App\Modules\Services\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use App\Modules\Services\Presentation\Http\Resources\ServiceCategoryResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/services — published categories with their published services (SDD A18, P15).
 */
class ServicesController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $categories = ServiceCategory::query()
            ->published()
            ->with(['services' => fn ($query) => $query->published()->orderBy('sort_order')->orderBy('id')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return ServiceCategoryResource::collection($categories)->additional(['locale' => app()->getLocale()]);
    }
}

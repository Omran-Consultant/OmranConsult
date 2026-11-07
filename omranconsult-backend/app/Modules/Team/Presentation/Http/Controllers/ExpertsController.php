<?php

namespace App\Modules\Team\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Team\Infrastructure\Models\TeamMember;
use App\Modules\Team\Presentation\Http\Resources\ExpertResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/experts (SDD P12).
 */
class ExpertsController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $experts = TeamMember::query()
            ->published()
            ->where('is_expert', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return ExpertResource::collection($experts)->additional(['locale' => app()->getLocale()]);
    }
}

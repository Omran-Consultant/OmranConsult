<?php

namespace App\Modules\Partners\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Partners\Infrastructure\Models\Partner;
use App\Modules\Partners\Presentation\Http\Resources\PartnerResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/partners (SDD P14).
 */
class PartnersController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $partners = Partner::query()->published()->orderBy('sort_order')->orderBy('id')->get();

        return PartnerResource::collection($partners)->additional(['locale' => app()->getLocale()]);
    }
}

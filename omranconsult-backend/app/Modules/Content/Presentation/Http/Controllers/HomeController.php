<?php

namespace App\Modules\Content\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Modules\Content\Presentation\Http\Resources\HeroSlideResource;
use App\Modules\Content\Presentation\Http\Resources\StatisticResource;
use App\Support\Content\PublicLocale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET /api/home — hero slides, statistics, and home content blocks (SDD §7.1).
 */
class HomeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $slides = HeroSlide::query()->published()->orderBy('sort_order')->orderBy('id')->get();
        $statistics = Statistic::query()->published()->orderBy('sort_order')->orderBy('id')->get();
        $blocks = ContentBlock::query()
            ->published()
            ->where('page', 'home')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->mapWithKeys(fn (ContentBlock $block): array => [
                $block->section_key => PublicLocale::resolveTree($block->payload),
            ]);

        return response()->json([
            'locale' => app()->getLocale(),
            'data' => [
                'hero_slides' => HeroSlideResource::collection($slides)->resolve($request),
                'statistics' => StatisticResource::collection($statistics)->resolve($request),
                'blocks' => (object) $blocks->all(),
            ],
        ]);
    }
}

<?php

namespace App\Modules\Content\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Support\Content\PublicLocale;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/pages/{page} — published content blocks of one page, including the design copy
 * (SDD §6.7 P22, §7.1). Home blocks are also part of GET /api/home.
 */
class PagesController extends Controller
{
    public const PAGES = ['home', 'about', 'services', 'projects', 'contact', 'media', 'layout'];

    public function __invoke(string $page): JsonResponse
    {
        abort_unless(in_array($page, self::PAGES, true), 404, 'Not found.');

        $blocks = ContentBlock::query()
            ->published()
            ->where('page', $page)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->mapWithKeys(fn (ContentBlock $block): array => [
                $block->section_key => PublicLocale::resolveTree($block->payload),
            ]);

        return response()->json([
            'locale' => app()->getLocale(),
            'data' => ['blocks' => (object) $blocks->all()],
        ]);
    }
}

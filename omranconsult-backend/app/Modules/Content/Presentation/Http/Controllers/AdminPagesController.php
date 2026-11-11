<?php

namespace App\Modules\Content\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Application\BlockPayloadShape;
use App\Modules\Content\Application\HomeSectors;
use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Support\Audit\AuditLogger;
use App\Support\Cms\DispatchFrontendRevalidation;
use App\Support\Content\DraftStore;
use App\Support\Content\PublicationStatus;
use App\Support\Content\PublishGate;
use App\Support\Content\SemanticIcons;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Site pages (PHASE5B 5B-3a): the seeded content blocks of every public page, the hero slides and
 * section dividers, the statistics, and the ordered Home sectors. All under /api/admin/pages,
 * `auth:sanctum` + `dashboard` + a `content.pages.*` permission per route (routes/api.php).
 *
 * Blocks, slides and statistics are seeded records the public pages read by key, so there is no
 * create or delete here. Editing a published record writes a draft (A40); the live row changes on
 * publish. Errors use the Laravel 422 shape with stable codes.
 *
 * GET    /pages                               → { data: [{ page, blocks: [{ id, section_key, status, updated_at }] }] }
 * GET    /pages/blocks/{id}                   → block detail { id, page, section_key, payload, draft, status,
 *                                               has_unpublished_changes, publish_blockers, published_at, updated_at, icons }
 * PATCH  /pages/blocks/{id}  { payload }      → block detail; 422 payload.* shape_mismatch | too_long | invalid_icon |
 *                                               invalid_href | items_required | too_many_items
 * POST   /pages/blocks/{id}/publish           → block detail; 422 with the publish blockers
 * POST   /pages/blocks/{id}/discard-draft     → block detail
 * GET    /pages/hero-slides                   → { data: [slide detail { id, key, headline, subline, ... }] }
 * PATCH  /pages/hero-slides/{id}  { headline: {ar,en}, subline: {ar,en} }
 * POST   /pages/hero-slides/{id}/publish | /discard-draft
 * GET    /pages/statistics                    → { data: [statistic detail { id, key, value, unit, suffix, scale, label, ... }] }
 * PATCH  /pages/statistics/{id}  { value, unit: {ar,en}|null, suffix, scale, label: {ar,en} }
 * POST   /pages/statistics/{id}/publish | /discard-draft
 * GET    /pages/home-sectors                  → { slugs: [...], is_default, max, sectors: [{ slug, name: {ar,en} }] }
 * PUT    /pages/home-sectors  { slugs: [...] } → same shape; publishes the order at once (no draft state)
 */
class AdminPagesController extends Controller
{
    /** Blocks with their own editor elsewhere: tools (Services) and the Home sectors order. */
    public const EXCLUDED_SECTIONS = ['tools', HomeSectors::SECTION_KEY];

    private const SCALES = ['million', 'billion'];

    public function __construct(
        private readonly DraftStore $drafts,
        private readonly PublishGate $gate,
        private readonly AuditLogger $audit,
    ) {}

    public function index(): JsonResponse
    {
        $blocks = ContentBlock::query()
            ->whereNotIn('section_key', self::EXCLUDED_SECTIONS)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $drafted = $this->draftedIds(new ContentBlock, $blocks->modelKeys());

        return response()->json([
            'data' => collect(PagesController::PAGES)->map(fn (string $page): array => [
                'page' => $page,
                'blocks' => $blocks->where('page', $page)->map(fn (ContentBlock $block): array => [
                    'id' => $block->id,
                    'section_key' => $block->section_key,
                    'status' => $this->statusBadge($block, in_array($block->id, $drafted, true)),
                    'updated_at' => $block->updated_at?->toIso8601String(),
                ])->values(),
            ])->values(),
        ]);
    }

    public function showBlock(ContentBlock $contentBlock): JsonResponse
    {
        return response()->json($this->blockDetail($contentBlock, $this->drafts->find($contentBlock)));
    }

    public function updateBlock(Request $request, ContentBlock $contentBlock): JsonResponse
    {
        $payload = $request->input('payload');
        if (! is_array($payload)) {
            throw ValidationException::withMessages(['payload' => ['required']]);
        }
        $errors = BlockPayloadShape::errors($contentBlock->payload, $payload);
        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        return $this->save($request, $contentBlock, ['payload' => $payload], 'content_block_updated', fn (?ContentDraft $draft) => $this->blockDetail($contentBlock->fresh(), $draft));
    }

    public function publishBlock(Request $request, ContentBlock $contentBlock): JsonResponse
    {
        $this->publish($request, $contentBlock, ['payload' => $contentBlock->payload], 'content_block_published');
        DispatchFrontendRevalidation::forPage($contentBlock->page);

        return response()->json($this->blockDetail($contentBlock->fresh(), null));
    }

    public function discardBlockDraft(Request $request, ContentBlock $contentBlock): JsonResponse
    {
        $this->discard($request, $contentBlock);

        return response()->json($this->blockDetail($contentBlock->fresh(), null));
    }

    public function heroSlides(): JsonResponse
    {
        $slides = HeroSlide::query()->orderBy('sort_order')->orderBy('id')->get();
        $drafts = $this->draftsFor(new HeroSlide, $slides->modelKeys());

        return response()->json([
            'data' => $slides->map(fn (HeroSlide $slide): array => $this->slideDetail($slide, $drafts[$slide->id] ?? null))->values(),
        ]);
    }

    public function updateHeroSlide(Request $request, HeroSlide $heroSlide): JsonResponse
    {
        $validated = $request->validate([
            'headline' => ['sometimes', 'array:ar,en'],
            'headline.ar' => ['nullable', 'string', 'max:191'],
            'headline.en' => ['nullable', 'string', 'max:191'],
            'subline' => ['sometimes', 'array:ar,en'],
            'subline.ar' => ['nullable', 'string', 'max:500'],
            'subline.en' => ['nullable', 'string', 'max:500'],
        ]);

        return $this->save($request, $heroSlide, array_merge($this->slideLive($heroSlide), $validated), 'hero_slide_updated', fn (?ContentDraft $draft) => $this->slideDetail($heroSlide->fresh(), $draft));
    }

    public function publishHeroSlide(Request $request, HeroSlide $heroSlide): JsonResponse
    {
        $this->publish($request, $heroSlide, $this->slideLive($heroSlide), 'hero_slide_published');
        DispatchFrontendRevalidation::forHomeContent();

        return response()->json($this->slideDetail($heroSlide->fresh(), null));
    }

    public function discardHeroSlideDraft(Request $request, HeroSlide $heroSlide): JsonResponse
    {
        $this->discard($request, $heroSlide);

        return response()->json($this->slideDetail($heroSlide->fresh(), null));
    }

    public function statistics(): JsonResponse
    {
        $statistics = Statistic::query()->orderBy('sort_order')->orderBy('id')->get();
        $drafts = $this->draftsFor(new Statistic, $statistics->modelKeys());

        return response()->json([
            'data' => $statistics->map(fn (Statistic $statistic): array => $this->statisticDetail($statistic, $drafts[$statistic->id] ?? null))->values(),
        ]);
    }

    public function updateStatistic(Request $request, Statistic $statistic): JsonResponse
    {
        $validated = $request->validate([
            'value' => ['sometimes', 'numeric', 'min:0', 'max:999999999.99'],
            'unit' => ['sometimes', 'nullable', 'array:ar,en'],
            'unit.ar' => ['nullable', 'string', 'max:32'],
            'unit.en' => ['nullable', 'string', 'max:32'],
            'suffix' => ['sometimes', 'nullable', 'string', 'max:4'],
            'scale' => ['sometimes', 'nullable', Rule::in(self::SCALES)],
            'label' => ['sometimes', 'array:ar,en'],
            'label.ar' => ['nullable', 'string', 'max:191'],
            'label.en' => ['nullable', 'string', 'max:191'],
        ]);

        return $this->save($request, $statistic, array_merge($this->statisticLive($statistic), $validated), 'statistic_updated', fn (?ContentDraft $draft) => $this->statisticDetail($statistic->fresh(), $draft));
    }

    public function publishStatistic(Request $request, Statistic $statistic): JsonResponse
    {
        $this->publish($request, $statistic, $this->statisticLive($statistic), 'statistic_published');
        DispatchFrontendRevalidation::forHomeContent();

        return response()->json($this->statisticDetail($statistic->fresh(), null));
    }

    public function discardStatisticDraft(Request $request, Statistic $statistic): JsonResponse
    {
        $this->discard($request, $statistic);

        return response()->json($this->statisticDetail($statistic->fresh(), null));
    }

    public function homeSectors(): JsonResponse
    {
        return response()->json([
            'slugs' => HomeSectors::slugs(),
            'is_default' => HomeSectors::block() === null,
            'max' => HomeSectors::MAX,
            'sectors' => Sector::query()->published()->orderBy('sort_order')->orderBy('id')->get()
                ->map(fn (Sector $sector): array => ['slug' => $sector->slug, 'name' => $sector->name])
                ->values(),
        ]);
    }

    public function updateHomeSectors(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slugs' => ['required', 'array', 'min:1', 'max:'.HomeSectors::MAX],
            'slugs.*' => [
                'string',
                'distinct',
                Rule::exists('sectors', 'slug')->where('status', PublicationStatus::Published->value)->whereNull('deleted_at'),
            ],
        ]);

        $block = HomeSectors::publish(array_values($validated['slugs']));
        $this->audit->write($request->user(), 'home_sectors_updated', ContentBlock::class, $block->id, ['slugs' => $validated['slugs']], $request);
        DispatchFrontendRevalidation::forPage('home');

        return $this->homeSectors();
    }

    /**
     * A published record keeps its live row and takes a draft (A40); an unpublished one is written directly.
     *
     * @param  array<string, mixed>  $payload
     * @param  callable(?ContentDraft): array<string, mixed>  $detail
     */
    private function save(Request $request, Model $subject, array $payload, string $action, callable $detail): JsonResponse
    {
        if ($subject->getAttribute('status') === PublicationStatus::Published) {
            $draft = $this->drafts->put($subject, $payload, $request->user());
            $this->audit->write($request->user(), 'draft_saved', $subject::class, $subject->getKey(), array_keys($payload), $request);

            return response()->json($detail($draft));
        }

        $this->drafts->apply($subject, $payload);
        $this->audit->write($request->user(), $action, $subject::class, $subject->getKey(), array_keys($payload), $request);

        return response()->json($detail(null));
    }

    /**
     * @param  array<string, mixed>  $live
     */
    private function publish(Request $request, Model $subject, array $live, string $action): void
    {
        $payload = $this->drafts->find($subject)?->payload ?? $live;
        $this->gate->assertCanPublish($subject, $payload);
        $this->drafts->apply($subject, $payload);
        $subject->forceFill([
            'status' => PublicationStatus::Published,
            'published_at' => $subject->getAttribute('published_at') ?? now(),
        ])->save();
        $this->drafts->discard($subject);
        $this->audit->write($request->user(), $action, $subject::class, $subject->getKey(), null, $request);
    }

    private function discard(Request $request, Model $subject): void
    {
        $this->drafts->discard($subject);
        $this->audit->write($request->user(), 'draft_discarded', $subject::class, $subject->getKey(), null, $request);
    }

    /**
     * @return array<string, mixed>
     */
    private function blockDetail(ContentBlock $block, ?ContentDraft $draft): array
    {
        return [
            'id' => $block->id,
            'page' => $block->page,
            'section_key' => $block->section_key,
            'payload' => $block->payload,
            'draft' => $draft?->payload['payload'] ?? null,
            ...$this->lifecycle($block, $draft, ['payload' => $block->payload]),
            'icons' => SemanticIcons::all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function slideDetail(HeroSlide $slide, ?ContentDraft $draft): array
    {
        return [
            'id' => $slide->id,
            'key' => $slide->key,
            ...$this->slideLive($slide),
            'draft' => $draft?->payload,
            ...$this->lifecycle($slide, $draft, $this->slideLive($slide)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function statisticDetail(Statistic $statistic, ?ContentDraft $draft): array
    {
        return [
            'id' => $statistic->id,
            'key' => $statistic->key,
            ...$this->statisticLive($statistic),
            'draft' => $draft?->payload,
            ...$this->lifecycle($statistic, $draft, $this->statisticLive($statistic)),
        ];
    }

    /**
     * @param  array<string, mixed>  $live
     * @return array<string, mixed>
     */
    private function lifecycle(Model $subject, ?ContentDraft $draft, array $live): array
    {
        return [
            'status' => $this->statusBadge($subject, $draft !== null),
            'has_unpublished_changes' => $draft !== null,
            'publish_blockers' => $this->gate->blockers($subject, $draft?->payload ?? $live),
            'published_at' => $subject->getAttribute('published_at')?->toIso8601String(),
            'updated_at' => ($draft?->updated_at ?? $subject->getAttribute('updated_at'))?->toIso8601String(),
        ];
    }

    /**
     * @return array{headline: mixed, subline: mixed}
     */
    private function slideLive(HeroSlide $slide): array
    {
        return ['headline' => $slide->headline, 'subline' => $slide->subline];
    }

    /**
     * @return array{value: int|float, unit: mixed, suffix: ?string, scale: ?string, label: mixed}
     */
    private function statisticLive(Statistic $statistic): array
    {
        $value = (float) $statistic->value;

        return [
            'value' => floor($value) === $value ? (int) $value : $value,
            'unit' => $statistic->unit,
            'suffix' => $statistic->suffix,
            'scale' => $statistic->scale,
            'label' => $statistic->label,
        ];
    }

    private function statusBadge(Model $subject, bool $hasDraft): string
    {
        if ($subject->getAttribute('status') === PublicationStatus::Published) {
            return $hasDraft ? 'published_with_draft' : 'published';
        }

        return 'draft';
    }

    /**
     * @param  list<int>  $ids
     * @return list<int>
     */
    private function draftedIds(Model $subject, array $ids): array
    {
        return array_keys($this->draftsFor($subject, $ids));
    }

    /**
     * @param  list<int>  $ids
     * @return array<int, ContentDraft>
     */
    private function draftsFor(Model $subject, array $ids): array
    {
        return ContentDraft::query()
            ->where('subject_type', $subject->getMorphClass())
            ->whereIn('subject_id', $ids)
            ->get()
            ->keyBy('subject_id')
            ->all();
    }
}

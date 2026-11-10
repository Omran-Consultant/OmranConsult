<?php

namespace App\Modules\Services\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Services\Domain\ServiceCategoryKind;
use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use App\Support\Audit\AuditLogger;
use App\Support\Cms\DispatchFrontendRevalidation;
use App\Support\Content\DraftStore;
use App\Support\Content\PublicationStatus;
use App\Support\Content\PublishGate;
use App\Support\Content\SemanticIcons;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminServicesController extends Controller
{
    public function __construct(
        private readonly DraftStore $drafts,
        private readonly PublishGate $gate,
        private readonly AuditLogger $audit,
    ) {}

    public function index(): JsonResponse
    {
        $categories = ServiceCategory::withTrashed()
            ->with(['services' => fn ($query) => $query->withTrashed()->orderBy('sort_order')->orderBy('id')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $draftIds = ContentDraft::query()
            ->where('subject_type', (new ServiceCategory)->getMorphClass())
            ->whereIn('subject_id', $categories->modelKeys())
            ->pluck('subject_id')
            ->all();

        $serviceDraftIds = ContentDraft::query()
            ->where('subject_type', (new Service)->getMorphClass())
            ->whereIn('subject_id', $categories->flatMap->services->modelKeys())
            ->pluck('subject_id')
            ->all();

        return response()->json([
            'data' => $categories->map(function (ServiceCategory $category) use ($draftIds, $serviceDraftIds): array {
                return [
                    'id' => $category->id,
                    'slug' => $category->slug,
                    'kind' => $category->kind?->value ?? $category->kind,
                    'title' => $category->title,
                    'icon' => $category->icon,
                    'sort_order' => $category->sort_order,
                    'status' => $this->statusBadge($category, in_array($category->id, $draftIds, true)),
                    'services' => $category->services->map(fn (Service $service): array => [
                        'id' => $service->id,
                        'slug' => $service->slug,
                        'title' => $service->title,
                        'sort_order' => $service->sort_order,
                        'status' => $this->statusBadge($service, in_array($service->id, $serviceDraftIds, true)),
                    ])->values(),
                    'updated_at' => $category->updated_at?->toIso8601String(),
                ];
            })->values(),
        ]);
    }

    public function showCategory(ServiceCategory $serviceCategory): JsonResponse
    {
        return response()->json($this->categoryDetail($serviceCategory, $this->drafts->find($serviceCategory)));
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('service_categories', 'slug')],
            'kind' => ['sometimes', Rule::enum(ServiceCategoryKind::class)],
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:64'],
        ]);
        $this->assertIcon($validated['icon'] ?? null);

        $category = ServiceCategory::query()->create([
            'slug' => $validated['slug'] ?? $this->uniqueSlug('service_categories', 'category'),
            'kind' => $validated['kind'] ?? ServiceCategoryKind::Axis,
            'title' => ['ar' => $validated['title']['ar'] ?? '', 'en' => $validated['title']['en'] ?? ''],
            'icon' => $validated['icon'] ?? null,
            'status' => PublicationStatus::Draft,
            'sort_order' => ((int) ServiceCategory::withTrashed()->max('sort_order')) + 1,
        ]);
        $this->audit->write($request->user(), 'service_category_created', ServiceCategory::class, $category->id, null, $request);

        return response()->json($this->categoryDetail($category, null), 201);
    }

    public function updateCategory(Request $request, ServiceCategory $serviceCategory): JsonResponse
    {
        $payload = $this->validatedCategory($request, $serviceCategory);
        $merged = array_merge($this->categoryLive($serviceCategory), $payload);

        if ($serviceCategory->status === PublicationStatus::Published && ! $serviceCategory->trashed()) {
            $draft = $this->drafts->put($serviceCategory, $merged, $request->user());
            $this->audit->write($request->user(), 'draft_saved', ServiceCategory::class, $serviceCategory->id, array_keys($payload), $request);

            return response()->json($this->categoryDetail($serviceCategory->fresh(), $draft));
        }

        $this->drafts->apply($serviceCategory, $merged);
        $this->audit->write($request->user(), 'service_category_updated', ServiceCategory::class, $serviceCategory->id, array_keys($payload), $request);

        return response()->json($this->categoryDetail($serviceCategory->fresh(), null));
    }

    public function publishCategory(Request $request, ServiceCategory $serviceCategory): JsonResponse
    {
        if ($serviceCategory->trashed()) {
            throw ValidationException::withMessages(['category' => ['trashed']]);
        }
        $draft = $this->drafts->find($serviceCategory);
        $payload = $draft?->payload ?? $this->categoryLive($serviceCategory);
        $this->gate->assertCanPublish($serviceCategory, $payload);
        $this->drafts->apply($serviceCategory, $payload);
        $serviceCategory->forceFill([
            'status' => PublicationStatus::Published,
            'published_at' => $serviceCategory->published_at ?? now(),
        ])->save();
        $this->drafts->discard($serviceCategory);
        DispatchFrontendRevalidation::forServices();
        $this->audit->write($request->user(), 'service_category_published', ServiceCategory::class, $serviceCategory->id, null, $request);

        return response()->json($this->categoryDetail($serviceCategory->fresh(), null));
    }

    public function discardCategoryDraft(Request $request, ServiceCategory $serviceCategory): JsonResponse
    {
        $this->drafts->discard($serviceCategory);
        $this->audit->write($request->user(), 'draft_discarded', ServiceCategory::class, $serviceCategory->id, null, $request);

        return response()->json($this->categoryDetail($serviceCategory->fresh(), null));
    }

    public function destroyCategory(Request $request, ServiceCategory $serviceCategory): JsonResponse
    {
        $wasPublished = $serviceCategory->status === PublicationStatus::Published;
        $serviceCategory->delete();
        $this->drafts->discard($serviceCategory);
        if ($wasPublished) {
            DispatchFrontendRevalidation::forServices();
        }
        $this->audit->write($request->user(), 'service_category_deleted', ServiceCategory::class, $serviceCategory->id, null, $request);

        return response()->json($this->categoryDetail($serviceCategory->fresh(), null));
    }

    public function restoreCategory(Request $request, ServiceCategory $serviceCategory): JsonResponse
    {
        if (ServiceCategory::withTrashed()->where('slug', $serviceCategory->slug)->whereNull('deleted_at')->where('id', '!=', $serviceCategory->id)->exists()) {
            throw ValidationException::withMessages(['slug' => ['slug_taken']]);
        }
        $serviceCategory->restore();
        if ($serviceCategory->status === PublicationStatus::Published) {
            DispatchFrontendRevalidation::forServices();
        }
        $this->audit->write($request->user(), 'service_category_restored', ServiceCategory::class, $serviceCategory->id, null, $request);

        return response()->json($this->categoryDetail($serviceCategory->fresh(), null));
    }

    public function reorderCategories(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['integer', Rule::exists('service_categories', 'id')],
        ]);
        foreach (array_values($validated['order']) as $index => $id) {
            ServiceCategory::withTrashed()->whereKey($id)->update(['sort_order' => $index + 1]);
        }
        DispatchFrontendRevalidation::forServices();
        $this->audit->write($request->user(), 'service_categories_reordered', ServiceCategory::class, null, $validated['order'], $request);

        return $this->index();
    }

    public function showService(Service $service): JsonResponse
    {
        return response()->json($this->serviceDetail($service, $this->drafts->find($service)));
    }

    public function storeService(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('service_categories', 'id')],
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('services', 'slug')],
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
        ]);
        $service = Service::query()->create([
            'category_id' => $validated['category_id'],
            'slug' => $validated['slug'] ?? $this->uniqueSlug('services', 'service'),
            'title' => ['ar' => $validated['title']['ar'] ?? '', 'en' => $validated['title']['en'] ?? ''],
            'status' => PublicationStatus::Draft,
            'sort_order' => ((int) Service::withTrashed()->where('category_id', $validated['category_id'])->max('sort_order')) + 1,
        ]);
        $this->audit->write($request->user(), 'service_created', Service::class, $service->id, null, $request);

        return response()->json($this->serviceDetail($service, null), 201);
    }

    public function updateService(Request $request, Service $service): JsonResponse
    {
        $payload = $this->validatedService($request, $service);
        $merged = array_merge($this->serviceLive($service), $payload);

        if ($service->status === PublicationStatus::Published && ! $service->trashed()) {
            $draft = $this->drafts->put($service, $merged, $request->user());
            $this->audit->write($request->user(), 'draft_saved', Service::class, $service->id, array_keys($payload), $request);

            return response()->json($this->serviceDetail($service->fresh(), $draft));
        }

        $this->drafts->apply($service, $merged);
        $this->audit->write($request->user(), 'service_updated', Service::class, $service->id, array_keys($payload), $request);

        return response()->json($this->serviceDetail($service->fresh(), null));
    }

    public function publishService(Request $request, Service $service): JsonResponse
    {
        if ($service->trashed()) {
            throw ValidationException::withMessages(['service' => ['trashed']]);
        }
        $draft = $this->drafts->find($service);
        $payload = $draft?->payload ?? $this->serviceLive($service);
        $this->gate->assertCanPublish($service, $payload);
        $this->drafts->apply($service, $payload);
        $service->forceFill([
            'status' => PublicationStatus::Published,
            'published_at' => $service->published_at ?? now(),
        ])->save();
        $this->drafts->discard($service);
        DispatchFrontendRevalidation::forServices();
        $this->audit->write($request->user(), 'service_published', Service::class, $service->id, null, $request);

        return response()->json($this->serviceDetail($service->fresh(), null));
    }

    public function discardServiceDraft(Request $request, Service $service): JsonResponse
    {
        $this->drafts->discard($service);
        $this->audit->write($request->user(), 'draft_discarded', Service::class, $service->id, null, $request);

        return response()->json($this->serviceDetail($service->fresh(), null));
    }

    public function destroyService(Request $request, Service $service): JsonResponse
    {
        $wasPublished = $service->status === PublicationStatus::Published;
        $service->delete();
        $this->drafts->discard($service);
        if ($wasPublished) {
            DispatchFrontendRevalidation::forServices();
        }
        $this->audit->write($request->user(), 'service_deleted', Service::class, $service->id, null, $request);

        return response()->json($this->serviceDetail($service->fresh(), null));
    }

    public function restoreService(Request $request, Service $service): JsonResponse
    {
        if (Service::withTrashed()->where('slug', $service->slug)->whereNull('deleted_at')->where('id', '!=', $service->id)->exists()) {
            throw ValidationException::withMessages(['slug' => ['slug_taken']]);
        }
        $service->restore();
        if ($service->status === PublicationStatus::Published) {
            DispatchFrontendRevalidation::forServices();
        }
        $this->audit->write($request->user(), 'service_restored', Service::class, $service->id, null, $request);

        return response()->json($this->serviceDetail($service->fresh(), null));
    }

    public function reorderServices(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('service_categories', 'id')],
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['integer', Rule::exists('services', 'id')],
        ]);
        foreach (array_values($validated['order']) as $index => $id) {
            Service::withTrashed()->whereKey($id)->where('category_id', $validated['category_id'])->update(['sort_order' => $index + 1]);
        }
        DispatchFrontendRevalidation::forServices();
        $this->audit->write($request->user(), 'services_reordered', Service::class, null, $validated['order'], $request);

        return $this->index();
    }

    public function tools(): JsonResponse
    {
        $blocks = ContentBlock::query()->where('section_key', 'tools')->orderBy('page')->get();

        return response()->json([
            'icons' => SemanticIcons::all(),
            'data' => $blocks->map(fn (ContentBlock $block): array => [
                'id' => $block->id,
                'page' => $block->page,
                'payload' => $this->normalizeToolsPayload($block->payload ?? []),
                'status' => $block->status?->value ?? $block->status,
            ])->values(),
        ]);
    }

    public function updateTools(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.title' => ['required', 'array'],
            'items.*.title.ar' => ['required', 'string', 'max:191'],
            'items.*.title.en' => ['required', 'string', 'max:191'],
            'items.*.body' => ['required', 'array'],
            'items.*.body.ar' => ['required', 'string', 'max:4000'],
            'items.*.body.en' => ['required', 'string', 'max:4000'],
            'items.*.icon' => ['nullable', 'string', 'max:64'],
        ]);
        foreach ($validated['items'] as $item) {
            $this->assertIcon($item['icon'] ?? null);
        }

        $payload = [
            'section_title' => [
                'ar' => 'الأدوات والممكنات',
                'en' => 'Tools and enablers',
            ],
            'items' => array_values($validated['items']),
        ];

        ContentBlock::query()->where('section_key', 'tools')->each(function (ContentBlock $block) use ($payload): void {
            $existingTitle = is_array($block->payload['section_title'] ?? null) ? $block->payload['section_title'] : $payload['section_title'];
            $block->forceFill([
                'payload' => [
                    'section_title' => $existingTitle,
                    'items' => $payload['items'],
                ],
            ])->save();
        });

        DispatchFrontendRevalidation::forServices();
        $this->audit->write($request->user(), 'service_tools_updated', ContentBlock::class, null, ['tools'], $request);

        return $this->tools();
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedCategory(Request $request, ServiceCategory $category): array
    {
        $validated = $request->validate([
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('service_categories', 'slug')->ignore($category->id)],
            'kind' => ['sometimes', Rule::enum(ServiceCategoryKind::class)],
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:64'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ]);
        if (array_key_exists('icon', $validated)) {
            $this->assertIcon($validated['icon']);
        }
        if (array_key_exists('kind', $validated) && $validated['kind'] instanceof ServiceCategoryKind) {
            $validated['kind'] = $validated['kind']->value;
        }

        return $validated;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedService(Request $request, Service $service): array
    {
        return $request->validate([
            'category_id' => ['sometimes', 'integer', Rule::exists('service_categories', 'id')],
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('services', 'slug')->ignore($service->id)],
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function categoryLive(ServiceCategory $category): array
    {
        return [
            'slug' => $category->slug,
            'kind' => $category->kind?->value ?? $category->kind,
            'title' => $category->title,
            'icon' => $category->icon,
            'sort_order' => $category->sort_order,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serviceLive(Service $service): array
    {
        return [
            'category_id' => $service->category_id,
            'slug' => $service->slug,
            'title' => $service->title,
            'sort_order' => $service->sort_order,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function categoryDetail(ServiceCategory $category, ?ContentDraft $draft): array
    {
        return [
            'id' => $category->id,
            'slug' => $category->slug,
            'kind' => $category->kind?->value ?? $category->kind,
            'title' => $category->title,
            'icon' => $category->icon,
            'sort_order' => $category->sort_order,
            'status' => $category->trashed() ? 'trashed' : ($category->status?->value ?? $category->status),
            'has_unpublished_changes' => $draft !== null,
            'draft' => $draft?->payload,
            'publish_blockers' => $this->gate->blockers($category, $draft?->payload ?? $this->categoryLive($category)),
            'published_at' => $category->published_at?->toIso8601String(),
            'updated_at' => $category->updated_at?->toIso8601String(),
            'icons' => SemanticIcons::all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serviceDetail(Service $service, ?ContentDraft $draft): array
    {
        return [
            'id' => $service->id,
            'category_id' => $service->category_id,
            'slug' => $service->slug,
            'title' => $service->title,
            'sort_order' => $service->sort_order,
            'status' => $service->trashed() ? 'trashed' : ($service->status?->value ?? $service->status),
            'has_unpublished_changes' => $draft !== null,
            'draft' => $draft?->payload,
            'publish_blockers' => $this->gate->blockers($service, $draft?->payload ?? $this->serviceLive($service)),
            'published_at' => $service->published_at?->toIso8601String(),
            'updated_at' => $service->updated_at?->toIso8601String(),
        ];
    }

    private function statusBadge(ServiceCategory|Service $model, bool $hasDraft): string
    {
        if ($model->trashed()) {
            return 'trashed';
        }
        if ($model->status === PublicationStatus::Published) {
            return $hasDraft ? 'published_with_draft' : 'published';
        }

        return 'draft';
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeToolsPayload(array $payload): array
    {
        $items = is_array($payload['items'] ?? null) ? $payload['items'] : [];
        $defaults = ['hard-hat', 'clipboard', 'chart', 'car', 'total-station', 'gps', 'desktop', 'printer', 'copy', 'jeep', 'fingerprint', 'drone', 'blueprint'];

        return [
            'section_title' => $payload['section_title'] ?? ['ar' => '', 'en' => ''],
            'items' => array_values(array_map(function (mixed $item, int $index) use ($defaults): array {
                $row = is_array($item) ? $item : [];

                return [
                    'title' => is_array($row['title'] ?? null) ? $row['title'] : ['ar' => '', 'en' => ''],
                    'body' => is_array($row['body'] ?? null) ? $row['body'] : ['ar' => '', 'en' => ''],
                    'icon' => is_string($row['icon'] ?? null) && $row['icon'] !== '' ? $row['icon'] : ($defaults[$index] ?? 'cog'),
                ];
            }, $items, array_keys($items))),
        ];
    }

    private function assertIcon(mixed $icon): void
    {
        if (! is_string($icon) && $icon !== null) {
            throw ValidationException::withMessages(['icon' => ['invalid_icon']]);
        }
        if (! SemanticIcons::isAllowed($icon)) {
            throw ValidationException::withMessages(['icon' => ['invalid_icon']]);
        }
    }

    private function uniqueSlug(string $table, string $prefix): string
    {
        do {
            $slug = $prefix.'-'.Str::lower(Str::random(8));
        } while (DB::table($table)->where('slug', $slug)->exists());

        return $slug;
    }
}

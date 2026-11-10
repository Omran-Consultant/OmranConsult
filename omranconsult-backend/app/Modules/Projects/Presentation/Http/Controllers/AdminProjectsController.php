<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Projects\Application\ProjectGallery;
use App\Modules\Projects\Domain\DeliveryStatus;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Support\Audit\AuditLogger;
use App\Support\Cms\DispatchFrontendRevalidation;
use App\Support\Content\ContentBlocks;
use App\Support\Content\DraftStore;
use App\Support\Content\PreviewTokenService;
use App\Support\Content\PublicationStatus;
use App\Support\Content\PublishGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminProjectsController extends Controller
{
    public function __construct(
        private readonly DraftStore $drafts,
        private readonly PublishGate $gate,
        private readonly PreviewTokenService $preview,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $projects = Project::withTrashed()
            ->with(['client:id,name', 'sector:id,name,default_image', 'regions:id,name'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('slug', 'like', '%'.$search.'%')
                        ->orWhere('title->ar', 'like', '%'.$search.'%')
                        ->orWhere('title->en', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(30);

        $draftIds = ContentDraft::query()
            ->where('subject_type', (new Project)->getMorphClass())
            ->whereIn('subject_id', $projects->getCollection()->modelKeys())
            ->pluck('subject_id')
            ->all();

        return response()->json([
            'data' => $projects->getCollection()->map(function (Project $project) use ($draftIds): array {
                return $this->listItem($project, in_array($project->id, $draftIds, true));
            })->values(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    public function show(Project $project): JsonResponse
    {
        $project->load(['client', 'sector', 'regions']);

        return response()->json($this->detail($project, $this->drafts->find($project)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('projects', 'slug')],
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
        ]);

        $project = Project::query()->create([
            'slug' => $validated['slug'] ?? $this->uniqueSlug(),
            'title' => [
                'ar' => $validated['title']['ar'] ?? '',
                'en' => $validated['title']['en'] ?? '',
            ],
            'overview' => ['ar' => [], 'en' => []],
            'gallery' => [],
            'scope' => ['ar' => [], 'en' => []],
            'status' => PublicationStatus::Draft,
            'sort_order' => ((int) Project::withTrashed()->max('sort_order')) + 1,
        ]);
        $this->audit->write($request->user(), 'project_created', Project::class, $project->id, null, $request);

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), null), 201);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $project->load(['client', 'sector', 'regions']);
        $payload = $this->validatedPayload($request, $project);
        $merged = $this->canonicalize(array_merge($this->livePayload($project), $payload));
        if (array_key_exists('overview', $payload)) {
            ContentBlocks::assertNotClearingLocaleMap(
                $this->overviewMap($project->overview),
                $merged['overview'],
                'overview',
                $request->boolean('confirm_clear'),
            );
        }

        // The first dashboard save, draft or live, means an editor has taken over this record.
        $project->forceFill(['has_demo_content' => false])->save();

        if ($project->status === PublicationStatus::Published && ! $project->trashed()) {
            $draft = $this->drafts->put($project, $merged, $request->user());
            $this->syncMedia($project, $merged);
            $this->audit->write($request->user(), 'draft_saved', Project::class, $project->id, array_keys($payload), $request);

            return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), $draft));
        }

        $this->drafts->apply($project, $merged);
        $this->syncMedia($project, $merged);
        $this->audit->write($request->user(), 'project_updated', Project::class, $project->id, array_keys($payload), $request);

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), null));
    }

    public function publish(Request $request, Project $project): JsonResponse
    {
        if ($project->trashed()) {
            throw ValidationException::withMessages(['project' => ['trashed']]);
        }

        $project->load('regions');
        $draft = $this->drafts->find($project);
        $payload = $this->canonicalize($draft?->payload ?? $this->livePayload($project));
        $this->gate->assertCanPublish($project, $payload);

        $this->drafts->apply($project, $payload);
        $project->forceFill([
            'status' => PublicationStatus::Published,
            'published_at' => $project->published_at ?? now(),
        ])->save();
        $this->drafts->discard($project);
        $this->syncMedia($project, $payload);
        $this->audit->write($request->user(), 'project_published', Project::class, $project->id, null, $request);
        DispatchFrontendRevalidation::forProject($project);

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), null));
    }

    public function discardDraft(Request $request, Project $project): JsonResponse
    {
        $this->drafts->discard($project);
        $project->load('regions');
        $this->syncMedia($project, $this->livePayload($project));
        $this->audit->write($request->user(), 'draft_discarded', Project::class, $project->id, null, $request);

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), null));
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        if (! $project->trashed()) {
            $wasPublished = $project->status === PublicationStatus::Published;
            $project->delete();
            $this->audit->write($request->user(), 'project_deleted', Project::class, $project->id, null, $request);
            if ($wasPublished) {
                DispatchFrontendRevalidation::forProject($project);
            }
        }

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), $this->drafts->find($project)));
    }

    public function restore(Request $request, Project $project): JsonResponse
    {
        if ($project->trashed()) {
            $conflict = Project::withTrashed()
                ->where('slug', $project->slug)
                ->whereKeyNot($project->id)
                ->exists();
            if ($conflict) {
                throw ValidationException::withMessages(['slug' => ['slug_taken']]);
            }

            $project->restore();
            $this->audit->write($request->user(), 'project_restored', Project::class, $project->id, null, $request);
            if ($project->status === PublicationStatus::Published) {
                DispatchFrontendRevalidation::forProject($project);
            }
        }

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), $this->drafts->find($project)));
    }

    public function previewToken(Request $request, Project $project): JsonResponse
    {
        $locale = $request->validate(['locale' => ['sometimes', 'in:ar,en']])['locale'] ?? 'ar';
        $issued = $this->preview->issue($request->user(), $project, '/'.$locale.'/projects/'.$project->slug);

        return response()->json($issued);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request, Project $project): array
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'overview' => ['sometimes', 'array'],
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('projects', 'slug')->ignore($project->id)],
            'client_id' => ['sometimes', 'nullable', 'integer', Rule::exists('clients', 'id')],
            'sector_id' => ['sometimes', 'nullable', 'integer', Rule::exists('sectors', 'id')],
            'year' => ['sometimes', 'nullable', 'integer', 'between:1900,2100'],
            'location' => ['sometimes', 'array'],
            'location.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'location.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'service_type' => ['sometimes', 'array'],
            'service_type.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'service_type.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'delivery_status' => ['sometimes', 'nullable', Rule::enum(DeliveryStatus::class)],
            'scope' => ['sometimes', 'array'],
            'scope.ar' => ['sometimes', 'array'],
            'scope.ar.*' => ['nullable', 'string', 'max:500'],
            'scope.en' => ['sometimes', 'array'],
            'scope.en.*' => ['nullable', 'string', 'max:500'],
            'gallery' => ['sometimes', 'array'],
            'region_ids' => ['sometimes', 'array'],
            'region_ids.*' => ['integer', Rule::exists('regions', 'id')],
            'is_featured' => ['sometimes', 'boolean'],
            'featured_order' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:999'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            'seo' => ['sometimes', 'array'],
            'seo.title' => ['sometimes', 'array'],
            'seo.title.ar' => ['sometimes', 'nullable', 'string', 'max:120'],
            'seo.title.en' => ['sometimes', 'nullable', 'string', 'max:120'],
            'seo.description' => ['sometimes', 'array'],
            'seo.description.ar' => ['sometimes', 'nullable', 'string', 'max:320'],
            'seo.description.en' => ['sometimes', 'nullable', 'string', 'max:320'],
            'og_image_media_id' => ['sometimes', 'nullable', 'integer', Rule::exists('media', 'id')],
            'confirm_clear' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('overview', $validated)) {
            $validated['overview'] = ContentBlocks::validateLocaleMap($validated['overview'], 'overview');
        }
        unset($validated['confirm_clear']);

        if (array_key_exists('gallery', $validated)) {
            $validated['gallery'] = ProjectGallery::normalize($validated['gallery']);
            $this->assertMediaExists($validated['gallery']);
        }

        return $validated;
    }

    /**
     * @param  list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>  $items
     */
    private function assertMediaExists(array $items): void
    {
        $ids = array_values(array_unique(array_filter(array_map(
            fn (array $item): ?int => $item['media_id'],
            $items,
        ))));

        if ($ids === []) {
            return;
        }

        $found = Media::query()->whereIn('id', $ids)->where('mime_type', 'like', 'image/%')->count();
        if ($found !== count($ids)) {
            throw ValidationException::withMessages(['gallery' => ['unknown_media']]);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function canonicalize(array $payload): array
    {
        if (array_key_exists('overview', $payload)) {
            $payload['overview'] = $this->overviewMap($payload['overview']);
        }

        if (array_key_exists('gallery', $payload)) {
            $payload['gallery'] = ProjectGallery::stored($payload['gallery']);
        }

        if (array_key_exists('scope', $payload) && is_array($payload['scope'])) {
            foreach (['ar', 'en'] as $locale) {
                $items = $payload['scope'][$locale] ?? [];
                if (! is_array($items)) {
                    continue;
                }
                $payload['scope'][$locale] = array_values(array_filter(
                    $items,
                    fn (mixed $item): bool => is_string($item) && trim($item) !== '',
                ));
            }
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncMedia(Project $project, array $payload): void
    {
        $og = $payload['og_image_media_id'] ?? $project->og_image_media_id;
        ProjectGallery::syncReferences(
            $project,
            ProjectGallery::stored($payload['gallery'] ?? $project->gallery),
            is_int($og) ? $og : (is_numeric($og) ? (int) $og : null),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function livePayload(Project $project): array
    {
        return [
            'title' => $project->title,
            'overview' => $this->overviewMap($project->overview),
            'slug' => $project->slug,
            'client_id' => $project->client_id,
            'sector_id' => $project->sector_id,
            'year' => $project->year,
            'location' => $project->location,
            'service_type' => $project->service_type,
            'delivery_status' => $project->delivery_status instanceof DeliveryStatus ? $project->delivery_status->value : $project->delivery_status,
            'scope' => $project->scope,
            'gallery' => ProjectGallery::stored($project->gallery),
            'region_ids' => $project->regions->modelKeys(),
            'is_featured' => $project->is_featured,
            'featured_order' => $project->featured_order,
            'sort_order' => $project->sort_order,
            'seo' => $project->seo,
            'og_image_media_id' => $project->og_image_media_id,
        ];
    }

    /**
     * @return array{ar: list<array<string, mixed>>, en: list<array<string, mixed>>}
     */
    private function overviewMap(mixed $overview): array
    {
        $map = is_array($overview) ? $overview : [];

        return [
            'ar' => ContentBlocks::coerce($map['ar'] ?? null),
            'en' => ContentBlocks::coerce($map['en'] ?? null),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function listItem(Project $project, bool $hasDraft): array
    {
        $badge = 'draft';
        if ($project->trashed()) {
            $badge = 'trashed';
        } elseif ($project->status === PublicationStatus::Published) {
            $badge = $hasDraft ? 'published_with_draft' : 'published';
        }

        $cover = ProjectGallery::cover(ProjectGallery::stored($project->gallery));

        return [
            'id' => $project->id,
            'slug' => $project->slug,
            'title' => $project->title,
            'status' => $badge,
            'client_id' => $project->client_id,
            'sector_id' => $project->sector_id,
            'client_name' => $project->client?->name,
            'sector_name' => $project->sector?->name,
            'region_names' => $project->regions->map(fn ($region) => $region->name)->values(),
            'cover_path' => $project->imageKey(),
            'cover_url' => $cover['url'] ?? null,
            'year' => $project->year,
            'has_demo_content' => $project->has_demo_content,
            'updated_at' => $project->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(Project $project, ?ContentDraft $draft): array
    {
        $payload = $draft?->payload;
        $overview = $this->overviewForEditor($project, $draft);
        $gatePayload = is_array($payload) ? $this->canonicalize($payload) : $this->livePayload($project);
        $gatePayload['overview'] = $overview;

        return [
            'id' => $project->id,
            'slug' => $project->slug,
            'title' => $project->title,
            'overview' => $overview,
            'client_id' => $project->client_id,
            'sector_id' => $project->sector_id,
            'year' => $project->year,
            'location' => $project->location,
            'service_type' => $project->service_type,
            'delivery_status' => $project->delivery_status instanceof DeliveryStatus ? $project->delivery_status->value : $project->delivery_status,
            'scope' => $project->scope ?? ['ar' => [], 'en' => []],
            'gallery' => ProjectGallery::present(ProjectGallery::stored($project->gallery), true),
            'region_ids' => $project->regions->modelKeys(),
            'is_featured' => (bool) $project->is_featured,
            'featured_order' => $project->featured_order,
            'sort_order' => $project->sort_order,
            'seo' => $project->seo ?? ['title' => ['ar' => '', 'en' => ''], 'description' => ['ar' => '', 'en' => '']],
            'og_image_media_id' => $project->og_image_media_id,
            'status' => $project->trashed() ? 'trashed' : ($project->status?->value ?? $project->status),
            'has_unpublished_changes' => $draft !== null,
            'draft' => is_array($payload) ? $this->presentDraft($payload) : null,
            'published_at' => $project->published_at?->toIso8601String(),
            'publish_blockers' => $this->gate->blockers($project, $gatePayload),
            'has_demo_content' => $project->has_demo_content,
            'client_name' => $project->client?->name,
            'sector_name' => $project->sector?->name,
            'updated_at' => $project->updated_at?->toIso8601String(),
            'lookups' => $this->lookups(),
        ];
    }

    /**
     * @return array{ar: list<array<string, mixed>>, en: list<array<string, mixed>>}
     */
    private function overviewForEditor(Project $project, ?ContentDraft $draft): array
    {
        $live = $this->overviewMap($project->overview);
        if ($draft === null || ! is_array($draft->payload['overview'] ?? null)) {
            return $live;
        }
        $draftOverview = $this->overviewMap($draft->payload['overview']);

        return [
            'ar' => ContentBlocks::preferVisible($draftOverview['ar'], $live['ar']),
            'en' => ContentBlocks::preferVisible($draftOverview['en'], $live['en']),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function presentDraft(array $payload): array
    {
        if (array_key_exists('overview', $payload)) {
            $payload['overview'] = $this->overviewMap($payload['overview']);
        }
        if (array_key_exists('gallery', $payload)) {
            $payload['gallery'] = ProjectGallery::present(ProjectGallery::stored($payload['gallery']), true);
        }

        return $payload;
    }

    /**
     * @return array{clients: mixed, sectors: mixed, regions: mixed}
     */
    private function lookups(): array
    {
        return [
            'clients' => Client::query()->orderBy('id')->get(['id', 'name', 'slug']),
            'sectors' => Sector::query()->orderBy('sort_order')->orderBy('id')->get(['id', 'name', 'slug']),
            'regions' => Region::query()->orderBy('sort_order')->orderBy('id')->get(['id', 'name', 'slug']),
        ];
    }

    private function uniqueSlug(): string
    {
        do {
            $slug = 'project-'.Str::lower(Str::random(8));
        } while (Project::withTrashed()->where('slug', $slug)->exists());

        return $slug;
    }
}

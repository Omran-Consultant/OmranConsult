<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Audit\AuditLogger;
use App\Support\Cms\DispatchFrontendRevalidation;
use App\Support\Content\DraftStore;
use App\Support\Content\PreviewTokenService;
use App\Support\Content\PublicationStatus;
use App\Support\Content\PublishGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $projects = Project::query()
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
        $draft = $this->drafts->find($project);

        return response()->json($this->detail($project, $draft));
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $payload = $this->validatedPayload($request, $project);
        $merged = array_merge($this->livePayload($project), $payload);

        if ($project->status === PublicationStatus::Published) {
            $draft = $this->drafts->put($project, $merged, $request->user());
            $this->audit->write($request->user(), 'draft_saved', Project::class, $project->id, array_keys($payload), $request);

            return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), $draft));
        }

        $this->drafts->apply($project, $merged);
        $this->audit->write($request->user(), 'project_updated', Project::class, $project->id, array_keys($payload), $request);

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), null));
    }

    public function publish(Request $request, Project $project): JsonResponse
    {
        $draft = $this->drafts->find($project);
        $payload = $draft?->payload ?? $this->livePayload($project);
        $this->gate->assertCanPublish($project, $payload);

        $this->drafts->apply($project, $payload);
        $project->forceFill([
            'status' => PublicationStatus::Published,
            'published_at' => $project->published_at ?? now(),
        ])->save();
        $this->drafts->discard($project);
        $this->audit->write($request->user(), 'project_published', Project::class, $project->id, null, $request);
        DispatchFrontendRevalidation::forProject($project);

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), null));
    }

    public function discardDraft(Request $request, Project $project): JsonResponse
    {
        $this->drafts->discard($project);
        $this->audit->write($request->user(), 'draft_discarded', Project::class, $project->id, null, $request);

        return response()->json($this->detail($project->fresh(['client', 'sector', 'regions']), null));
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
            'title.ar' => ['sometimes', 'nullable', 'string'],
            'title.en' => ['sometimes', 'nullable', 'string'],
            'overview' => ['sometimes', 'array'],
            'overview.ar' => ['sometimes', 'nullable', 'string'],
            'overview.en' => ['sometimes', 'nullable', 'string'],
            'slug' => ['sometimes', 'string', 'max:191'],
            'client_id' => ['sometimes', 'nullable', 'integer'],
            'sector_id' => ['sometimes', 'nullable', 'integer'],
            'year' => ['sometimes', 'nullable', 'integer'],
            'gallery' => ['sometimes', 'array'],
            'gallery.*' => ['string'],
            'region_ids' => ['sometimes', 'array'],
            'region_ids.*' => ['integer'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        unset($validated['locale']);

        return $validated;
    }

    /**
     * @return array<string, mixed>
     */
    private function livePayload(Project $project): array
    {
        return [
            'title' => $project->title,
            'overview' => $project->overview,
            'slug' => $project->slug,
            'client_id' => $project->client_id,
            'sector_id' => $project->sector_id,
            'year' => $project->year,
            'gallery' => $project->gallery ?? [],
            'region_ids' => $project->regions->modelKeys(),
            'is_featured' => $project->is_featured,
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
            'year' => $project->year,
            'updated_at' => $project->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(Project $project, ?ContentDraft $draft): array
    {
        return [
            'id' => $project->id,
            'slug' => $project->slug,
            'title' => $project->title,
            'overview' => $project->overview,
            'client_id' => $project->client_id,
            'sector_id' => $project->sector_id,
            'year' => $project->year,
            'location' => $project->location,
            'scope' => $project->scope,
            'gallery' => $project->gallery,
            'region_ids' => $project->regions->modelKeys(),
            'is_featured' => $project->is_featured,
            'status' => $project->status?->value ?? $project->status,
            'has_unpublished_changes' => $draft !== null,
            'draft' => $draft?->payload,
            'published_at' => $project->published_at?->toIso8601String(),
            'publish_blockers' => $this->gate->blockers($project, $draft?->payload ?? $this->livePayload($project)),
            'client_name' => $project->client?->name,
            'sector_name' => $project->sector?->name,
            'updated_at' => $project->updated_at?->toIso8601String(),
        ];
    }
}

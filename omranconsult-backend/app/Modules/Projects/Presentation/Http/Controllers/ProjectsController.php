<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\PreviewToken;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Modules\Projects\Presentation\Http\Requests\ProjectIndexRequest;
use App\Modules\Projects\Presentation\Http\Resources\ProjectDetailResource;
use App\Modules\Projects\Presentation\Http\Resources\ProjectResource;
use App\Support\Content\DraftStore;
use App\Support\Content\PreviewTokenService;
use App\Support\Content\PublicationStatus;
use App\Support\Content\PublicLocale;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/projects and GET /api/projects/{slug} (SDD §7.1, A20, P11).
 */
class ProjectsController extends Controller
{
    private const LIKE = " LIKE ? ESCAPE '!'";

    private const RELATED_LIMIT = 3;

    public function __construct(
        private readonly PreviewTokenService $previewTokens,
        private readonly DraftStore $drafts,
    ) {}

    public function index(ProjectIndexRequest $request): AnonymousResourceCollection
    {
        $projects = $this->publicQuery()
            ->when($request->validated('client'), fn (Builder $query, string $slug) => $query->whereHas(
                'client',
                fn (Builder $client) => $client->published()->where('slug', $slug),
            ))
            ->when($request->validated('region'), fn (Builder $query, string $slug) => $query->whereHas(
                'regions',
                fn (Builder $region) => $region->published()->where('slug', $slug),
            ))
            ->when($request->validated('sector'), fn (Builder $query, string $slug) => $query->whereHas(
                'sector',
                fn (Builder $sector) => $sector->published()->where('slug', $slug),
            ))
            ->when($request->validated('q'), fn (Builder $query, string $term) => $this->search($query, $term))
            ->when($request->validated('featured'), fn (Builder $query) => $query->where('is_featured', true)->orderBy('featured_order'))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate((int) $request->validated('per_page', ProjectIndexRequest::DEFAULT_PER_PAGE))
            ->withQueryString();

        return ProjectResource::collection($projects)->additional(['locale' => app()->getLocale()]);
    }

    public function show(Request $request, string $slug): ProjectDetailResource
    {
        $project = Project::query()
            ->with([
                'client' => fn ($query) => $query->published(),
                'sector' => fn ($query) => $query->published(),
                'regions' => fn ($query) => $query->published()->orderBy('sort_order'),
            ])
            ->where('slug', $slug)
            ->first();

        abort_if($project === null, 404, 'Not found.');

        $preview = $this->matchingPreview($request, $project);
        if ($preview === null && $project->status !== PublicationStatus::Published) {
            abort(404, 'Not found.');
        }

        if ($preview !== null) {
            $draft = $this->drafts->find($project);
            if ($draft !== null) {
                $fillable = array_intersect_key($draft->payload, array_flip($project->getFillable()));
                $project->fill($fillable);
                $regionIds = $draft->payload['region_ids'] ?? null;
                if (is_array($regionIds)) {
                    $project->setRelation('regions', Region::query()
                        ->whereIn('id', array_values(array_filter($regionIds, 'is_numeric')))
                        ->orderBy('sort_order')
                        ->get());
                }
            }
        }

        return (new ProjectDetailResource($project, $this->related($project)))->additional(['locale' => app()->getLocale()]);
    }

    private function matchingPreview(Request $request, Project $project): ?PreviewToken
    {
        $plain = (string) $request->header('X-Preview-Token', '');
        if ($plain === '') {
            return null;
        }

        $token = $this->previewTokens->findValid($plain);
        if ($token === null || ! $this->previewTokens->matches($token, $project)) {
            return null;
        }

        return $token;
    }

    /**
     * Up to three published projects: the same sector first, then the same owner (SDD §7.1).
     *
     * @return Collection<int, Project>
     */
    private function related(Project $project): Collection
    {
        $related = new Collection;

        foreach (['sector_id', 'client_id'] as $column) {
            if ($related->count() >= self::RELATED_LIMIT || $project->{$column} === null) {
                continue;
            }

            $related = $related->merge(
                $this->publicQuery()
                    ->where($column, $project->{$column})
                    ->whereKeyNot([$project->getKey(), ...$related->modelKeys()])
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->limit(self::RELATED_LIMIT - $related->count())
                    ->get(),
            );
        }

        return $related;
    }

    /**
     * Case-insensitive match on the title or the owner's name in either locale.
     * JSON paths keep the match on the decoded text in both MySQL and SQLite.
     *
     * @param  Builder<Project>  $query
     */
    private function search(Builder $query, string $term): void
    {
        // "!" escapes LIKE wildcards; SQLite has no default escape character.
        $pattern = '%'.str_replace(['!', '%', '_', '\\'], ['!!', '!%', '!_', '!\\'], mb_strtolower(trim($term))).'%';

        $query->where(function (Builder $where) use ($pattern): void {
            foreach (PublicLocale::SUPPORTED as $locale) {
                $where->orWhereRaw($this->lowerJson($where, "title->{$locale}").self::LIKE, [$pattern]);
            }

            $where->orWhereHas('client', function (Builder $client) use ($pattern): void {
                $client->published()->where(function (Builder $name) use ($pattern): void {
                    foreach (PublicLocale::SUPPORTED as $locale) {
                        $name->orWhereRaw($this->lowerJson($name, "name->{$locale}").self::LIKE, [$pattern]);
                    }
                });
            });
        });
    }

    /**
     * @param  Builder<covariant Model>  $query
     */
    private function lowerJson(Builder $query, string $path): string
    {
        return 'LOWER('.$query->getQuery()->getGrammar()->wrap($query->qualifyColumn($path)).')';
    }

    /**
     * @return Builder<Project>
     */
    private function publicQuery(): Builder
    {
        return Project::query()
            ->published()
            ->with([
                'client' => fn ($query) => $query->published(),
                'sector' => fn ($query) => $query->published(),
                'regions' => fn ($query) => $query->published()->orderBy('sort_order'),
            ]);
    }
}

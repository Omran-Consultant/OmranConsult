<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Presentation\Http\Requests\ProjectIndexRequest;
use App\Modules\Projects\Presentation\Http\Resources\ProjectResource;
use App\Support\Content\PublicLocale;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/projects and GET /api/projects/{slug} (SDD §7.1, A20, P11).
 */
class ProjectsController extends Controller
{
    private const LIKE = " LIKE ? ESCAPE '!'";

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
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate((int) $request->validated('per_page', ProjectIndexRequest::DEFAULT_PER_PAGE))
            ->withQueryString();

        return ProjectResource::collection($projects)->additional(['locale' => app()->getLocale()]);
    }

    public function show(string $slug): ProjectResource
    {
        $project = $this->publicQuery()->where('slug', $slug)->first();

        abort_if($project === null, 404, 'Not found.');

        return (new ProjectResource($project))->additional(['locale' => app()->getLocale()]);
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
        $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower(trim($term))).'%';

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

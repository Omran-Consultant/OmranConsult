<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Presentation\Http\Requests\ProjectIndexRequest;
use App\Modules\Projects\Presentation\Http\Resources\ProjectResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/projects and GET /api/projects/{slug} (SDD §7.1, A20, P11).
 */
class ProjectsController extends Controller
{
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
     * @return Builder<Project>
     */
    private function publicQuery(): Builder
    {
        return Project::query()
            ->published()
            ->with([
                'client' => fn ($query) => $query->published(),
                'regions' => fn ($query) => $query->published()->orderBy('sort_order'),
            ]);
    }
}

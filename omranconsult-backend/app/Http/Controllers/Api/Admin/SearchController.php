<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Projects\Infrastructure\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json(['data' => []]);
        }

        $projects = Project::query()
            ->where(function ($query) use ($q): void {
                $query->where('slug', 'like', '%'.$q.'%')
                    ->orWhere('title->en', 'like', '%'.$q.'%')
                    ->orWhere('title->ar', 'like', '%'.$q.'%');
            })
            ->orderBy('sort_order')
            ->limit(8)
            ->get(['id', 'slug', 'title', 'status']);

        return response()->json([
            'data' => $projects->map(fn (Project $project): array => [
                'type' => 'project',
                'id' => $project->id,
                'slug' => $project->slug,
                'title' => $project->title,
                'status' => $project->status?->value ?? $project->status,
                'href' => '/dashboard/projects/'.$project->id,
            ])->values(),
        ]);
    }
}

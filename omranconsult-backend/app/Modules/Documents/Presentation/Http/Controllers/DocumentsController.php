<?php

namespace App\Modules\Documents\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Documents\Infrastructure\Models\Document;
use App\Modules\Documents\Presentation\Http\Requests\DocumentIndexRequest;
use App\Modules\Documents\Presentation\Http\Resources\DocumentResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/documents — licenses and ISO certificates (SDD P13).
 * Expired documents stay listed; is_expired reports the state (SDD A26).
 */
class DocumentsController extends Controller
{
    public function __invoke(DocumentIndexRequest $request): AnonymousResourceCollection
    {
        $documents = Document::query()
            ->published()
            ->when($request->validated('kind'), fn ($query, string $kind) => $query->where('kind', $kind))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return DocumentResource::collection($documents)->additional(['locale' => app()->getLocale()]);
    }
}

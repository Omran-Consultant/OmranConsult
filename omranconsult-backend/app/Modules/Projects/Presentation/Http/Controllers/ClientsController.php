<?php

namespace App\Modules\Projects\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Presentation\Http\Resources\ClientResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/clients — clients and project owners (SDD A20, P11).
 */
class ClientsController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $clients = Client::query()
            ->published()
            ->withCount(['projects' => fn ($query) => $query->published()])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return ClientResource::collection($clients)->additional(['locale' => app()->getLocale()]);
    }
}

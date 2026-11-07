<?php

namespace App\Modules\Projects\Presentation\Http\Resources;

use App\Modules\Projects\Infrastructure\Models\Client;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Client
 */
class ClientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => PublicLocale::pick($this->name),
            'in_client_list' => $this->in_client_list,
            'projects_count' => $this->whenCounted('projects'),
        ];
    }
}

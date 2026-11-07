<?php

namespace App\Modules\News\Presentation\Http\Resources;

use App\Modules\News\Domain\NewsBlockType;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;

/**
 * GET /api/news/{slug}: list shape plus author, tags, body blocks and related posts (SDD §7.1).
 *
 * @mixin NewsPost
 */
class NewsPostDetailResource extends NewsPostResource
{
    /**
     * @param  iterable<int, NewsPost>  $related
     */
    public function __construct(NewsPost $resource, private readonly iterable $related = [])
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'author' => PublicLocale::pick($this->author),
            'tags' => PublicLocale::pickList($this->tags),
            'body' => $this->blocks(),
            'related' => NewsPostResource::collection(collect($this->related))->resolve($request),
        ];
    }

    /**
     * Blocks in the requested locale; unknown types and empty blocks are dropped.
     *
     * @return array<int, array{type: string, text?: string, image?: string}>
     */
    private function blocks(): array
    {
        $blocks = $this->body[app()->getLocale()] ?? [];
        $resolved = [];

        foreach (is_array($blocks) ? $blocks : [] as $block) {
            $type = is_array($block) ? NewsBlockType::tryFrom((string) ($block['type'] ?? '')) : null;

            if ($type === NewsBlockType::Image && is_string($block['image'] ?? null)) {
                $resolved[] = ['type' => $type->value, 'image' => $block['image']];
            } elseif ($type !== null && $type !== NewsBlockType::Image && is_string($block['text'] ?? null) && $block['text'] !== '') {
                $resolved[] = ['type' => $type->value, 'text' => $block['text']];
            }
        }

        return $resolved;
    }
}

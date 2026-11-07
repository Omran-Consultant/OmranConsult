<?php

namespace App\Modules\News\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\News\Infrastructure\Models\NewsCategory;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Modules\News\Presentation\Http\Requests\NewsIndexRequest;
use App\Modules\News\Presentation\Http\Resources\NewsCategoryResource;
use App\Modules\News\Presentation\Http\Resources\NewsPostDetailResource;
use App\Modules\News\Presentation\Http\Resources\NewsPostResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * GET /api/news-categories, /api/news, /api/news/{slug} (SDD §7.1, P21). Newest first.
 */
class NewsController extends Controller
{
    private const RELATED_LIMIT = 3;

    public function categories(): AnonymousResourceCollection
    {
        $categories = NewsCategory::query()->published()->orderBy('sort_order')->orderBy('id')->get();

        return NewsCategoryResource::collection($categories)->additional(['locale' => app()->getLocale()]);
    }

    public function index(NewsIndexRequest $request): AnonymousResourceCollection
    {
        $featured = $request->validated('featured');

        $posts = $this->publicQuery()
            ->when($request->validated('category'), fn (Builder $query, string $slug) => $query->whereHas(
                'category',
                fn (Builder $category) => $category->published()->where('slug', $slug),
            ))
            ->when($featured !== null, fn (Builder $query) => $query->where('is_featured', $featured === '1'))
            ->paginate((int) $request->validated('per_page', NewsIndexRequest::DEFAULT_PER_PAGE))
            ->withQueryString();

        return NewsPostResource::collection($posts)->additional(['locale' => app()->getLocale()]);
    }

    public function show(string $slug): NewsPostDetailResource
    {
        $post = $this->publicQuery()->where('slug', $slug)->first();

        abort_if($post === null, 404, 'Not found.');

        return (new NewsPostDetailResource($post, $this->related($post)))->additional(['locale' => app()->getLocale()]);
    }

    /**
     * Up to three posts: the same category first, then the latest others.
     *
     * @return Collection<int, NewsPost>
     */
    private function related(NewsPost $post): Collection
    {
        $related = new Collection;

        foreach ([true, false] as $sameCategory) {
            if ($related->count() >= self::RELATED_LIMIT || ($sameCategory && $post->news_category_id === null)) {
                continue;
            }

            $related = $related->merge(
                $this->publicQuery()
                    ->when($sameCategory, fn (Builder $query) => $query->where('news_category_id', $post->news_category_id))
                    ->whereKeyNot([$post->getKey(), ...$related->modelKeys()])
                    ->limit(self::RELATED_LIMIT - $related->count())
                    ->get(),
            );
        }

        return $related;
    }

    /**
     * @return Builder<NewsPost>
     */
    private function publicQuery(): Builder
    {
        return NewsPost::query()
            ->published()
            ->with(['category' => fn ($query) => $query->published()])
            ->orderByDesc('published_at')
            ->orderBy('sort_order')
            ->orderBy('id');
    }
}

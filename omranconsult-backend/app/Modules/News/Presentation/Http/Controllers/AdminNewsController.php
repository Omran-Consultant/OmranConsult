<?php

namespace App\Modules\News\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Media\Application\MediaUrls;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Media\Infrastructure\Models\MediaReference;
use App\Modules\News\Infrastructure\Models\NewsCategory;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Support\Audit\AuditLogger;
use App\Support\Cms\DispatchFrontendRevalidation;
use App\Support\Content\ContentBlocks;
use App\Support\Content\DraftStore;
use App\Support\Content\PublicationStatus;
use App\Support\Content\PublishGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminNewsController extends Controller
{
    public function __construct(
        private readonly DraftStore $drafts,
        private readonly PublishGate $gate,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $demo = $request->query('is_demo');
        $category = $request->query('category');

        $posts = NewsPost::withTrashed()
            ->with('category:id,slug,name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('slug', 'like', '%'.$search.'%')
                        ->orWhere('title->ar', 'like', '%'.$search.'%')
                        ->orWhere('title->en', 'like', '%'.$search.'%');
                });
            })
            ->when($demo === '1' || $demo === 'true', fn ($query) => $query->where('is_demo', true))
            ->when($demo === '0' || $demo === 'false', fn ($query) => $query->where('is_demo', false))
            ->when(is_string($category) && $category !== '', function ($query) use ($category): void {
                $query->whereHas('category', fn ($inner) => $inner->where('slug', $category));
            })
            ->orderByDesc('published_at')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(30);

        $draftIds = ContentDraft::query()
            ->where('subject_type', (new NewsPost)->getMorphClass())
            ->whereIn('subject_id', $posts->getCollection()->modelKeys())
            ->pluck('subject_id')
            ->all();

        return response()->json([
            'data' => $posts->getCollection()->map(function (NewsPost $post) use ($draftIds): array {
                $hasDraft = in_array($post->id, $draftIds, true);
                $status = 'draft';
                if ($post->trashed()) {
                    $status = 'trashed';
                } elseif ($post->status === PublicationStatus::Published) {
                    $status = $hasDraft ? 'published_with_draft' : 'published';
                }

                return [
                    'id' => $post->id,
                    'slug' => $post->slug,
                    'title' => $post->title,
                    'status' => $status,
                    'is_demo' => (bool) $post->is_demo,
                    'is_featured' => (bool) $post->is_featured,
                    'category' => $post->category ? [
                        'id' => $post->category->id,
                        'slug' => $post->category->slug,
                        'name' => $post->category->name,
                    ] : null,
                    'cover_image' => $post->cover_image,
                    'cover_url' => $this->coverUrl($post),
                    'published_at' => $post->published_at?->toIso8601String(),
                    'updated_at' => $post->updated_at?->toIso8601String(),
                ];
            })->values(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
            'lookups' => [
                'categories' => NewsCategory::query()->orderBy('sort_order')->orderBy('id')->get(['id', 'slug', 'name']),
            ],
        ]);
    }

    public function show(NewsPost $newsPost): JsonResponse
    {
        $newsPost->load('category');

        return response()->json($this->detail($newsPost, $this->drafts->find($newsPost)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('news_posts', 'slug')],
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
        ]);

        $post = NewsPost::query()->create([
            'slug' => $validated['slug'] ?? $this->uniqueSlug(),
            'title' => ['ar' => $validated['title']['ar'] ?? '', 'en' => $validated['title']['en'] ?? ''],
            'excerpt' => ['ar' => '', 'en' => ''],
            'body' => ['ar' => [], 'en' => []],
            'status' => PublicationStatus::Draft,
            'is_demo' => false,
            'is_featured' => false,
            'sort_order' => ((int) NewsPost::withTrashed()->max('sort_order')) + 1,
        ]);
        $this->audit->write($request->user(), 'news_created', NewsPost::class, $post->id, null, $request);

        return response()->json($this->detail($post->fresh('category'), null), 201);
    }

    public function update(Request $request, NewsPost $newsPost): JsonResponse
    {
        $payload = $this->validatedPayload($request, $newsPost);
        $merged = $this->canonicalize(array_merge($this->livePayload($newsPost), $payload));

        if ($newsPost->status === PublicationStatus::Published && ! $newsPost->trashed()) {
            $draft = $this->drafts->put($newsPost, $merged, $request->user());
            $this->syncMedia($newsPost, $merged);
            $this->audit->write($request->user(), 'draft_saved', NewsPost::class, $newsPost->id, array_keys($payload), $request);

            return response()->json($this->detail($newsPost->fresh('category'), $draft));
        }

        $this->drafts->apply($newsPost, $merged);
        $this->syncMedia($newsPost, $merged);
        $this->audit->write($request->user(), 'news_updated', NewsPost::class, $newsPost->id, array_keys($payload), $request);

        return response()->json($this->detail($newsPost->fresh('category'), null));
    }

    public function publish(Request $request, NewsPost $newsPost): JsonResponse
    {
        if ($newsPost->trashed()) {
            throw ValidationException::withMessages(['news' => ['trashed']]);
        }
        $draft = $this->drafts->find($newsPost);
        $payload = $this->canonicalize($draft?->payload ?? $this->livePayload($newsPost));
        $this->gate->assertCanPublish($newsPost, $payload);
        $this->drafts->apply($newsPost, $payload);
        $newsPost->forceFill([
            'status' => PublicationStatus::Published,
            'published_at' => $payload['published_at'] ?? $newsPost->published_at ?? now(),
        ])->save();
        $this->syncMedia($newsPost, $payload);
        $this->drafts->discard($newsPost);
        DispatchFrontendRevalidation::forNews($newsPost);
        $this->audit->write($request->user(), 'news_published', NewsPost::class, $newsPost->id, null, $request);

        return response()->json($this->detail($newsPost->fresh('category'), null));
    }

    public function discardDraft(Request $request, NewsPost $newsPost): JsonResponse
    {
        $this->drafts->discard($newsPost);
        $this->syncMedia($newsPost, $this->livePayload($newsPost));
        $this->audit->write($request->user(), 'draft_discarded', NewsPost::class, $newsPost->id, null, $request);

        return response()->json($this->detail($newsPost->fresh('category'), null));
    }

    public function destroy(Request $request, NewsPost $newsPost): JsonResponse
    {
        $wasPublished = $newsPost->status === PublicationStatus::Published;
        $newsPost->delete();
        $this->drafts->discard($newsPost);
        if ($wasPublished) {
            DispatchFrontendRevalidation::forNews($newsPost);
        }
        $this->audit->write($request->user(), 'news_deleted', NewsPost::class, $newsPost->id, null, $request);

        return response()->json($this->detail($newsPost->fresh('category'), null));
    }

    public function restore(Request $request, NewsPost $newsPost): JsonResponse
    {
        if (NewsPost::withTrashed()->where('slug', $newsPost->slug)->whereNull('deleted_at')->where('id', '!=', $newsPost->id)->exists()) {
            throw ValidationException::withMessages(['slug' => ['slug_taken']]);
        }
        $newsPost->restore();
        if ($newsPost->status === PublicationStatus::Published) {
            DispatchFrontendRevalidation::forNews($newsPost);
        }
        $this->audit->write($request->user(), 'news_restored', NewsPost::class, $newsPost->id, null, $request);

        return response()->json($this->detail($newsPost->fresh('category'), null));
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request, NewsPost $post): array
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'array'],
            'title.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'title.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'excerpt' => ['sometimes', 'array'],
            'excerpt.ar' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'excerpt.en' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'body' => ['sometimes', 'array'],
            'slug' => ['sometimes', 'string', 'max:191', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('news_posts', 'slug')->ignore($post->id)],
            'news_category_id' => ['sometimes', 'nullable', 'integer', Rule::exists('news_categories', 'id')],
            'cover_image' => ['sometimes', 'nullable', 'string', 'max:64'],
            'cover_media_id' => ['sometimes', 'nullable', 'integer', Rule::exists('media', 'id')],
            'author' => ['sometimes', 'array'],
            'author.ar' => ['sometimes', 'nullable', 'string', 'max:191'],
            'author.en' => ['sometimes', 'nullable', 'string', 'max:191'],
            'tags' => ['sometimes', 'array'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_demo' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'seo' => ['sometimes', 'array'],
            'seo.title' => ['sometimes', 'array'],
            'seo.title.ar' => ['sometimes', 'nullable', 'string', 'max:120'],
            'seo.title.en' => ['sometimes', 'nullable', 'string', 'max:120'],
            'seo.description' => ['sometimes', 'array'],
            'seo.description.ar' => ['sometimes', 'nullable', 'string', 'max:320'],
            'seo.description.en' => ['sometimes', 'nullable', 'string', 'max:320'],
            'og_image_media_id' => ['sometimes', 'nullable', 'integer', Rule::exists('media', 'id')],
        ]);

        if (array_key_exists('body', $validated)) {
            $validated['body'] = ContentBlocks::validateLocaleMap($validated['body'], 'body', true);
        }

        return $validated;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function canonicalize(array $payload): array
    {
        if (array_key_exists('body', $payload)) {
            $payload['body'] = [
                'ar' => ContentBlocks::coerce($payload['body']['ar'] ?? null),
                'en' => ContentBlocks::coerce($payload['body']['en'] ?? null),
            ];
        }
        if (array_key_exists('published_at', $payload) && $payload['published_at']) {
            $payload['published_at'] = Carbon::parse($payload['published_at'])->toIso8601String();
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncMedia(NewsPost $post, array $payload): void
    {
        MediaReference::query()
            ->where('referencer_type', $post->getMorphClass())
            ->where('referencer_id', $post->id)
            ->delete();

        $rows = [];
        $coverId = $payload['cover_media_id'] ?? $post->cover_media_id;
        if (is_numeric($coverId) && (int) $coverId > 0) {
            $rows[] = ['field' => 'cover', 'media_id' => (int) $coverId];
        }
        $ogId = $payload['og_image_media_id'] ?? $post->og_image_media_id;
        if (is_numeric($ogId) && (int) $ogId > 0) {
            $rows[] = ['field' => 'og_image', 'media_id' => (int) $ogId];
        }
        foreach (['ar', 'en'] as $locale) {
            $blocks = ContentBlocks::coerce(is_array($payload['body'] ?? null) ? ($payload['body'][$locale] ?? null) : null);
            foreach ($blocks as $index => $block) {
                if (($block['type'] ?? null) === 'image' && (int) ($block['media_id'] ?? 0) > 0) {
                    $rows[] = ['field' => "body.{$locale}.{$index}", 'media_id' => (int) $block['media_id']];
                }
            }
        }
        foreach ($rows as $row) {
            MediaReference::query()->create([
                'media_id' => $row['media_id'],
                'referencer_type' => $post->getMorphClass(),
                'referencer_id' => $post->id,
                'field' => $row['field'],
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function livePayload(NewsPost $post): array
    {
        return [
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'body' => [
                'ar' => ContentBlocks::coerce(is_array($post->body) ? ($post->body['ar'] ?? null) : null),
                'en' => ContentBlocks::coerce(is_array($post->body) ? ($post->body['en'] ?? null) : null),
            ],
            'slug' => $post->slug,
            'news_category_id' => $post->news_category_id,
            'cover_image' => $post->cover_image,
            'cover_media_id' => $post->cover_media_id,
            'author' => $post->author,
            'tags' => $post->tags,
            'is_featured' => $post->is_featured,
            'is_demo' => $post->is_demo,
            'sort_order' => $post->sort_order,
            'published_at' => $post->published_at?->toIso8601String(),
            'seo' => $post->seo,
            'og_image_media_id' => $post->og_image_media_id,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(NewsPost $post, ?ContentDraft $draft): array
    {
        return [
            'id' => $post->id,
            'slug' => $post->slug,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'body' => [
                'ar' => ContentBlocks::coerce(is_array($post->body) ? ($post->body['ar'] ?? null) : null),
                'en' => ContentBlocks::coerce(is_array($post->body) ? ($post->body['en'] ?? null) : null),
            ],
            'news_category_id' => $post->news_category_id,
            'cover_image' => $post->cover_image,
            'cover_media_id' => $post->cover_media_id,
            'cover_url' => $this->coverUrl($post),
            'author' => $post->author,
            'tags' => $post->tags,
            'is_featured' => (bool) $post->is_featured,
            'is_demo' => (bool) $post->is_demo,
            'sort_order' => $post->sort_order,
            'seo' => $post->seo ?? ['title' => ['ar' => '', 'en' => ''], 'description' => ['ar' => '', 'en' => '']],
            'og_image_media_id' => $post->og_image_media_id,
            'status' => $post->trashed() ? 'trashed' : ($post->status?->value ?? $post->status),
            'has_unpublished_changes' => $draft !== null,
            'draft' => $draft?->payload,
            'publish_blockers' => $this->gate->blockers($post, $draft?->payload ?? $this->livePayload($post)),
            'published_at' => $post->published_at?->toIso8601String(),
            'updated_at' => $post->updated_at?->toIso8601String(),
            'lookups' => [
                'categories' => NewsCategory::query()->orderBy('sort_order')->orderBy('id')->get(['id', 'slug', 'name']),
            ],
        ];
    }

    private function coverUrl(NewsPost $post): ?string
    {
        if ($post->cover_media_id) {
            $media = Media::query()->find($post->cover_media_id);
            if ($media instanceof Media) {
                return MediaUrls::url($media);
            }
        }

        return $post->cover_image ? '/images/site/'.$post->cover_image.'.jpg' : null;
    }

    private function uniqueSlug(): string
    {
        do {
            $slug = 'news-'.Str::lower(Str::random(8));
        } while (NewsPost::withTrashed()->where('slug', $slug)->exists());

        return $slug;
    }
}

<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\News\Infrastructure\Models\NewsCategory;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Support\Content\ContentBlocks;
use App\Support\Content\PublicationStatus;
use App\Support\DashboardPermission;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\DashboardRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminNewsWriteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DashboardRolesSeeder::class);
    }

    public function test_guest_cannot_list_news(): void
    {
        $this->getJson('/api/admin/news')->assertUnauthorized();
    }

    public function test_editor_without_create_cannot_store_news(): void
    {
        Role::findByName(EditorRole::NAME, EditorRole::GUARD)->revokePermissionTo(DashboardPermission::NEWS_CREATE);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $editor = User::factory()->create();
        $editor->assignRole(EditorRole::NAME);

        $this->actingAs($editor)->postJson('/api/admin/news', [
            'title' => ['ar' => 'خبر', 'en' => 'News'],
        ])->assertForbidden();
    }

    public function test_admin_can_create_edit_and_publish_news_with_cover(): void
    {
        Bus::fake();
        $admin = $this->admin();
        $category = NewsCategory::query()->create([
            'slug' => 'events',
            'name' => ['ar' => 'فعاليات', 'en' => 'Events'],
            'sort_order' => 1,
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);

        $create = $this->actingAs($admin)->postJson('/api/admin/news', [
            'title' => ['ar' => 'خبر تجريبي', 'en' => 'Demo news'],
        ])->assertCreated();
        $id = $create->json('id');

        $this->actingAs($admin)->patchJson("/api/admin/news/{$id}", [
            'title' => ['ar' => 'خبر تجريبي', 'en' => 'Demo news'],
            'excerpt' => ['ar' => 'ملخص', 'en' => 'Summary'],
            'body' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نص عربي']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'English body']]]],
            ],
            'news_category_id' => $category->id,
            'cover_image' => 'wave',
            'published_at' => now()->toIso8601String(),
        ])->assertOk();

        $this->actingAs($admin)->postJson("/api/admin/news/{$id}/publish")
            ->assertOk()
            ->assertJsonPath('status', 'published');

        $this->assertDatabaseHas('news_posts', ['id' => $id, 'cover_image' => 'wave']);
    }

    public function test_publish_requires_cover(): void
    {
        Bus::fake();
        $admin = $this->admin();
        $category = NewsCategory::query()->create([
            'slug' => 'events',
            'name' => ['ar' => 'فعاليات', 'en' => 'Events'],
            'sort_order' => 1,
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);

        $post = NewsPost::query()->create([
            'slug' => 'needs-cover',
            'title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'excerpt' => ['ar' => 'ملخص', 'en' => 'Summary'],
            'body' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نص']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Text']]]],
            ],
            'news_category_id' => $category->id,
            'status' => PublicationStatus::Draft,
            'published_at' => now(),
            'is_demo' => false,
            'is_featured' => false,
            'sort_order' => 99,
        ]);

        $this->actingAs($admin)->postJson("/api/admin/news/{$post->id}/publish")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['cover']);
    }

    public function test_show_surfaces_excerpt_as_body_when_body_is_empty(): void
    {
        $admin = $this->admin();
        $category = NewsCategory::query()->create([
            'slug' => 'company-news',
            'name' => ['ar' => 'أخبار', 'en' => 'News'],
            'sort_order' => 1,
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
        $post = NewsPost::query()->create([
            'slug' => 'excerpt-only',
            'title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'excerpt' => ['ar' => 'ملخص ظاهر للجمهور', 'en' => 'Public summary'],
            'body' => null,
            'news_category_id' => $category->id,
            'cover_image' => 'digital',
            'status' => PublicationStatus::Published,
            'published_at' => now(),
            'is_demo' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)->getJson("/api/admin/news/{$post->id}")
            ->assertOk()
            ->assertJsonPath('body.ar.0.children.0.text', 'ملخص ظاهر للجمهور')
            ->assertJsonPath('body.en.0.children.0.text', 'Public summary');
    }

    public function test_save_unchanged_keeps_legacy_body_byte_identical_after_coerce(): void
    {
        Bus::fake();
        $admin = $this->admin();
        $category = NewsCategory::query()->create([
            'slug' => 'projects',
            'name' => ['ar' => 'مشاريع', 'en' => 'Projects'],
            'sort_order' => 1,
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
        $body = [
            'ar' => [
                ['type' => 'paragraph', 'text' => 'فقرة أولى'],
                ['type' => 'heading', 'text' => 'عنوان'],
                ['type' => 'paragraph', 'text' => 'فقرة ثانية'],
            ],
            'en' => [
                ['type' => 'paragraph', 'text' => 'First paragraph'],
                ['type' => 'heading', 'text' => 'Heading'],
                ['type' => 'paragraph', 'text' => 'Second paragraph'],
            ],
        ];
        $post = NewsPost::query()->create([
            'slug' => 'legacy-body',
            'title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'excerpt' => ['ar' => 'ملخص', 'en' => 'Summary'],
            'body' => $body,
            'news_category_id' => $category->id,
            'cover_image' => 'wave',
            'status' => PublicationStatus::Published,
            'published_at' => now(),
            'is_demo' => false,
            'is_featured' => false,
            'sort_order' => 2,
        ]);

        $show = $this->actingAs($admin)->getJson("/api/admin/news/{$post->id}")->assertOk();
        $editorBody = $show->json('body');

        $this->actingAs($admin)->patchJson("/api/admin/news/{$post->id}", [
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'body' => $editorBody,
            'slug' => $post->slug,
            'news_category_id' => $category->id,
            'cover_image' => 'wave',
            'published_at' => $post->published_at?->toIso8601String(),
        ])->assertOk();

        $draftBody = $this->actingAs($admin)->getJson("/api/admin/news/{$post->id}")->json('body');
        $this->assertSame(
            ContentBlocks::plainText($editorBody['ar']),
            ContentBlocks::plainText($draftBody['ar']),
        );
        $this->assertSame(
            ContentBlocks::plainText($editorBody['en']),
            ContentBlocks::plainText($draftBody['en']),
        );
    }

    public function test_empty_body_overwrite_is_rejected_without_confirm_clear(): void
    {
        Bus::fake();
        $admin = $this->admin();
        $category = NewsCategory::query()->create([
            'slug' => 'articles',
            'name' => ['ar' => 'مقالات', 'en' => 'Articles'],
            'sort_order' => 1,
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
        $post = NewsPost::query()->create([
            'slug' => 'has-body',
            'title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'excerpt' => ['ar' => 'ملخص', 'en' => 'Summary'],
            'body' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نص محفوظ']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Stored text']]]],
            ],
            'news_category_id' => $category->id,
            'cover_image' => 'wave',
            'status' => PublicationStatus::Published,
            'published_at' => now(),
            'is_demo' => false,
            'is_featured' => false,
            'sort_order' => 3,
        ]);

        $this->actingAs($admin)->patchJson("/api/admin/news/{$post->id}", [
            'body' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => '']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => '']]]],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['body.en']);

        $this->actingAs($admin)->patchJson("/api/admin/news/{$post->id}", [
            'body' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => '']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => '']]]],
            ],
            'confirm_clear' => true,
        ])->assertOk();
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

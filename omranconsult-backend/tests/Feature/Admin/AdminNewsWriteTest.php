<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\News\Infrastructure\Models\NewsCategory;
use App\Modules\News\Infrastructure\Models\NewsPost;
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

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

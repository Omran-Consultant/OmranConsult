<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Media\Infrastructure\Models\MediaReference;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Modules\Projects\Infrastructure\Models\Sector;
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

class AdminProjectsWriteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DashboardRolesSeeder::class);
    }

    public function test_guest_cannot_create_and_user_without_permission_is_forbidden(): void
    {
        $this->postJson('/api/admin/projects', [])->assertUnauthorized();

        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/api/admin/projects', [])->assertForbidden();

        Role::findByName(EditorRole::NAME, EditorRole::GUARD)->revokePermissionTo(DashboardPermission::PROJECTS_CREATE);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $editor = $this->editor();
        $this->actingAs($editor)->postJson('/api/admin/projects', [])->assertForbidden();
    }

    public function test_admin_creates_edits_publishes_and_blocks_incomplete_projects(): void
    {
        Bus::fake();
        $admin = $this->admin();
        $client = $this->client();
        $sector = $this->sector();
        $region = Region::query()->create([
            'slug' => 'riyadh',
            'name' => ['ar' => 'الرياض', 'en' => 'Riyadh'],
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
        $media = Media::query()->create([
            'disk' => 'public',
            'path' => 'media/cover.webp',
            'filename' => 'cover.webp',
            'original_filename' => 'cover.webp',
            'mime_type' => 'image/webp',
            'size_bytes' => 10,
            'width' => 800,
            'height' => 600,
            'variants' => ['400' => 'media/cover-400.webp'],
        ]);

        $created = $this->actingAs($admin)->postJson('/api/admin/projects', [
            'title' => ['ar' => 'مشروع', 'en' => 'Project'],
        ])->assertCreated();

        $id = $created->json('id');
        $this->assertNotEmpty($created->json('publish_blockers'));

        $this->actingAs($admin)->patchJson('/api/admin/projects/'.$id, [
            'overview' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نبذة', 'bold' => true]]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Overview']]]],
            ],
            'client_id' => $client->id,
            'sector_id' => $sector->id,
            'region_ids' => [$region->id],
            'location' => ['ar' => 'الرياض', 'en' => 'Riyadh'],
            'year' => 2024,
            'delivery_status' => 'completed',
            'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
            'scope' => ['ar' => ['بند'], 'en' => ['Item']],
            'gallery' => [[
                'media_id' => $media->id,
                'alt' => ['ar' => 'غلاف', 'en' => 'Cover'],
            ]],
            'is_featured' => true,
            'featured_order' => 1,
            'sort_order' => 4,
            'seo' => [
                'title' => ['ar' => 'عنوان', 'en' => 'SEO title'],
                'description' => ['ar' => 'وصف', 'en' => 'SEO description'],
            ],
            'og_image_media_id' => $media->id,
        ])->assertOk()->assertJsonPath('publish_blockers', []);

        $this->actingAs($admin)->postJson('/api/admin/projects/'.$id.'/publish')->assertOk();

        $this->getJson('/api/projects/'.$created->json('slug'), ['Accept-Language' => 'en'])
            ->assertOk()
            ->assertJsonPath('data.overview.0.children.0.text', 'Overview')
            ->assertJsonPath('data.gallery.0.url', '/storage/media/cover.webp')
            ->assertJsonPath('data.gallery.0.srcset', '/storage/media/cover-400.webp 400w, /storage/media/cover.webp 800w')
            ->assertJsonPath('data.seo.title', 'SEO title')
            ->assertJsonPath('data.image_url', '/storage/media/cover.webp')
            ->assertJsonPath('data.location', 'Riyadh');

        $this->assertTrue(MediaReference::query()->where('media_id', $media->id)->exists());
    }

    public function test_publish_explains_missing_cover_alt_for_media(): void
    {
        $admin = $this->admin();
        $project = $this->draftProject();
        $media = Media::query()->create([
            'disk' => 'public',
            'path' => 'media/bare.webp',
            'filename' => 'bare.webp',
            'original_filename' => 'bare.webp',
            'mime_type' => 'image/webp',
            'size_bytes' => 10,
        ]);

        $this->actingAs($admin)->patchJson('/api/admin/projects/'.$project->id, [
            'title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'overview' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نبذة']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Overview']]]],
            ],
            'client_id' => $project->client_id,
            'sector_id' => $project->sector_id,
            'gallery' => [['media_id' => $media->id, 'alt' => ['ar' => '', 'en' => '']]],
        ])->assertOk();

        $this->actingAs($admin)->postJson('/api/admin/projects/'.$project->id.'/publish')
            ->assertUnprocessable()
            ->assertJsonPath('errors.gallery.0', 'cover_alt_required');
    }

    public function test_legacy_gallery_key_still_counts_as_a_cover(): void
    {
        Bus::fake();
        $admin = $this->admin();
        $project = $this->draftProject();
        $project->update([
            'title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'overview' => [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نبذة']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Overview']]]],
            ],
            'gallery' => ['wave'],
        ]);

        $this->actingAs($admin)->postJson('/api/admin/projects/'.$project->id.'/publish')
            ->assertOk()
            ->assertJsonPath('publish_blockers', []);
    }

    public function test_delete_and_restore_keep_the_slug(): void
    {
        $admin = $this->admin();
        $project = $this->draftProject();

        $this->actingAs($admin)->deleteJson('/api/admin/projects/'.$project->id)
            ->assertOk()
            ->assertJsonPath('status', 'trashed');

        $this->assertSoftDeleted('projects', ['id' => $project->id]);

        $this->actingAs($admin)->postJson('/api/admin/projects/'.$project->id.'/restore')
            ->assertOk()
            ->assertJsonPath('slug', $project->slug)
            ->assertJsonPath('status', 'draft');
    }

    public function test_unknown_block_is_rejected_on_save(): void
    {
        $admin = $this->admin();
        $project = $this->draftProject();

        $this->actingAs($admin)->patchJson('/api/admin/projects/'.$project->id, [
            'overview' => [
                'ar' => [['type' => 'html', 'children' => [['text' => '<b>x</b>']]]],
                'en' => [],
            ],
        ])->assertUnprocessable()->assertJsonValidationErrors('overview.ar.0');
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }

    private function editor(): User
    {
        $user = User::factory()->create();
        $user->assignRole(EditorRole::NAME);

        return $user;
    }

    private function client(): Client
    {
        return Client::query()->create([
            'slug' => 'owner',
            'name' => ['ar' => 'جهة', 'en' => 'Owner'],
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
    }

    private function sector(): Sector
    {
        return Sector::query()->create([
            'slug' => 'water',
            'name' => ['ar' => 'مياه', 'en' => 'Water'],
            'default_image' => 'aerial',
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
    }

    private function draftProject(): Project
    {
        return Project::query()->create([
            'slug' => 'draft-project',
            'client_id' => $this->client()->id,
            'sector_id' => $this->sector()->id,
            'title' => ['ar' => '', 'en' => ''],
            'status' => PublicationStatus::Draft,
        ]);
    }
}

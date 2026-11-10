<?php

namespace Tests\Feature\Admin;

use App\Jobs\RevalidateFrontendCache;
use App\Models\User;
use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Support\Audit\AuditLogger;
use App\Support\Content\PublicationStatus;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminProjectsDraftTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SuperAdminRoleSeeder::class);
    }

    public function test_patch_on_published_project_writes_draft_not_live_row(): void
    {
        $admin = $this->admin();
        $project = $this->publishedProject();

        $this->actingAs($admin)->patchJson('/api/admin/projects/'.$project->id, [
            'title' => ['ar' => 'مسودة', 'en' => 'Draft title'],
        ])->assertOk()->assertJsonPath('has_unpublished_changes', true);

        $this->assertSame('Live title', $project->fresh()->title['en']);
        $this->assertDatabaseHas('content_drafts', [
            'subject_id' => $project->id,
        ]);
        $this->getJson('/api/projects/'.$project->slug)
            ->assertOk()
            ->assertJsonPath('data.title', 'Live title');
    }

    public function test_preview_token_overlays_draft_and_ignores_other_subjects(): void
    {
        $admin = $this->admin();
        $project = $this->publishedProject();
        $other = $this->publishedProject('other-project');

        $this->actingAs($admin)->patchJson('/api/admin/projects/'.$project->id, [
            'title' => ['ar' => 'معاينة', 'en' => 'Preview title'],
        ])->assertOk();

        $token = $this->actingAs($admin)
            ->postJson('/api/admin/projects/'.$project->id.'/preview-token')
            ->assertOk()
            ->json('token');

        $this->getJson('/api/projects/'.$project->slug, ['X-Preview-Token' => $token])
            ->assertOk()
            ->assertJsonPath('data.title', 'Preview title');

        $this->getJson('/api/projects/'.$other->slug, ['X-Preview-Token' => $token])
            ->assertOk()
            ->assertJsonPath('data.title', 'Live title');
    }

    public function test_publish_applies_draft_and_dispatches_revalidation(): void
    {
        Bus::fake();
        $admin = $this->admin();
        $project = $this->publishedProject();

        $this->actingAs($admin)->patchJson('/api/admin/projects/'.$project->id, [
            'title' => ['ar' => 'منشور', 'en' => 'Published title'],
        ])->assertOk();

        $this->actingAs($admin)->postJson('/api/admin/projects/'.$project->id.'/publish')
            ->assertOk()
            ->assertJsonPath('has_unpublished_changes', false);

        $this->assertSame('Published title', $project->fresh()->title['en']);
        $this->assertSame(0, ContentDraft::query()->count());
        Bus::assertDispatched(RevalidateFrontendCache::class);
        $this->assertDatabaseHas('audit_logs', ['action' => 'project_published']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'draft_saved']);
        $this->getJson('/api/projects/'.$project->slug)->assertJsonPath('data.title', 'Published title');
    }

    public function test_publish_succeeds_when_revalidation_http_fails(): void
    {
        config(['cms.revalidation_secret' => 'test-revalidation-secret']);

        Http::fake([
            '*' => Http::response('error', 503),
        ]);

        $admin = $this->admin();
        $project = $this->publishedProject();

        $this->actingAs($admin)->patchJson('/api/admin/projects/'.$project->id, [
            'title' => ['ar' => 'منشور', 'en' => 'Published despite revalidation failure'],
        ])->assertOk();

        try {
            $this->actingAs($admin)->postJson('/api/admin/projects/'.$project->id.'/publish')
                ->assertOk()
                ->assertJsonPath('title.en', 'Published despite revalidation failure');
        } catch (\RuntimeException $exception) {
            if (! str_starts_with($exception->getMessage(), 'revalidation_failed')) {
                throw $exception;
            }
        }

        $this->assertDatabaseHas('audit_logs', ['action' => 'revalidation_failed']);
    }

    public function test_preview_lookup_requires_frontend_key(): void
    {
        $this->getJson('/api/internal/preview-tokens?token=abc')->assertUnauthorized();
    }

    public function test_publish_blocked_by_dispute(): void
    {
        $admin = $this->admin();
        $project = $this->publishedProject();
        ContentDispute::query()->create([
            'dispute_class' => 'editorial',
            'subject_type' => $project->getMorphClass(),
            'subject_id' => $project->id,
            'issue_code' => 'test_block',
            'description' => 'block',
            'status' => 'pending',
            'blocks_publish' => true,
        ]);

        $this->actingAs($admin)->postJson('/api/admin/projects/'.$project->id.'/publish')
            ->assertUnprocessable();
    }

    public function test_guest_cannot_update_project(): void
    {
        $project = $this->publishedProject();
        $this->patchJson('/api/admin/projects/'.$project->id, [
            'title' => ['en' => 'x', 'ar' => 'س'],
        ])->assertUnauthorized();
    }

    public function test_summary_counts_match_database(): void
    {
        $admin = $this->admin();
        $this->publishedProject();
        $published = Project::query()->where('status', PublicationStatus::Published)->count();
        $drafts = Project::query()->where('status', PublicationStatus::Draft)->count();

        $this->actingAs($admin)->getJson('/api/admin/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('kpis.projects_published', $published)
            ->assertJsonPath('kpis.projects_total', $published + $drafts)
            ->assertJsonPath('kpis.inquiries_new', 0);
    }

    public function test_summary_activity_includes_actor_name(): void
    {
        $admin = $this->admin();
        app(AuditLogger::class)->write($admin, 'project_published', Project::class, 1, null);

        $this->actingAs($admin)->getJson('/api/admin/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('recent_activity.0.user_name', $admin->name)
            ->assertJsonPath('recent_activity.0.action', 'project_published');
    }

    public function test_project_detail_includes_overview_and_publish_blockers(): void
    {
        $admin = $this->admin();
        $project = $this->publishedProject();

        $this->actingAs($admin)->getJson('/api/admin/projects/'.$project->id)
            ->assertOk()
            ->assertJsonPath('overview.ar.0.type', 'paragraph')
            ->assertJsonPath('overview.ar.0.children.0.text', 'نبذة')
            ->assertJsonStructure(['publish_blockers', 'published_at', 'client_name', 'sector_name', 'location', 'scope']);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }

    private function publishedProject(string $slug = 'live-project'): Project
    {
        $client = Client::query()->create([
            'slug' => $slug.'-client',
            'name' => ['ar' => 'جهة', 'en' => 'Client'],
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
        $sector = Sector::query()->create([
            'slug' => $slug.'-sector',
            'name' => ['ar' => 'قطاع', 'en' => 'Sector'],
            'default_image' => 'images/site/x.jpg',
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);

        return Project::query()->create([
            'slug' => $slug,
            'client_id' => $client->id,
            'sector_id' => $sector->id,
            'title' => ['ar' => 'حي', 'en' => 'Live title'],
            'overview' => ['ar' => 'نبذة', 'en' => 'Overview'],
            'gallery' => ['images/site/x.jpg'],
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);
    }
}

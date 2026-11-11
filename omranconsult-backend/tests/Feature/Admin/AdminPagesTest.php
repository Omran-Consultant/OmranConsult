<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\Audit\Infrastructure\Models\AuditLog;
use App\Modules\Content\Application\HomeSectors;
use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Support\Content\PublicationStatus;
use App\Support\DashboardPermission;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\DashboardRolesSeeder;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DashboardRolesSeeder::class);
        $this->seed(ProfileContentSeeder::class);
        Bus::fake();
    }

    public function test_a_guest_gets_401_and_a_user_without_the_permission_gets_403(): void
    {
        $block = $this->block('about', 'design_copy');
        $this->getJson('/api/admin/pages')->assertUnauthorized();
        $this->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => $block->payload])->assertUnauthorized();

        $editor = $this->editorWithout([DashboardPermission::PAGES_UPDATE, DashboardPermission::PAGES_PUBLISH]);
        $this->actingAs($editor)->getJson('/api/admin/pages')->assertOk();
        $this->actingAs($editor)->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => $block->payload])->assertForbidden();
        $this->actingAs($editor)->postJson('/api/admin/pages/blocks/'.$block->id.'/publish')->assertForbidden();
        $this->actingAs($editor)->putJson('/api/admin/pages/home-sectors', ['slugs' => ['health']])->assertForbidden();
        $slide = HeroSlide::query()->where('key', 'vision')->firstOrFail();
        $this->actingAs($editor)->patchJson('/api/admin/pages/hero-slides/'.$slide->id, ['headline' => ['ar' => 'س', 'en' => 's']])->assertForbidden();
        $statistic = Statistic::query()->where('key', 'employees')->firstOrFail();
        $this->actingAs($editor)->postJson('/api/admin/pages/statistics/'.$statistic->id.'/publish')->assertForbidden();
    }

    public function test_the_index_lists_every_public_page_with_its_blocks_and_hides_blocks_edited_elsewhere(): void
    {
        $response = $this->actingAs($this->admin())->getJson('/api/admin/pages')->assertOk();

        $this->assertSame(['home', 'about', 'services', 'projects', 'contact', 'media', 'layout'], $response->json('data.*.page'));
        $home = collect($response->json('data.0.blocks'))->pluck('section_key');
        $this->assertTrue($home->contains('design_copy'));
        $this->assertTrue($home->contains('work_stages'));
        $this->assertFalse($home->contains('tools'));
        $this->assertSame('published', $response->json('data.1.blocks.0.status'));

        $tools = $this->block('home', 'tools');
        $this->actingAs($this->admin())->getJson('/api/admin/pages/blocks/'.$tools->id)->assertNotFound();
    }

    public function test_saving_a_published_block_writes_a_draft_and_publish_makes_it_live(): void
    {
        $admin = $this->admin();
        $block = $this->block('about', 'design_copy');
        $original = $block->payload['hero']['title'];
        $payload = $block->payload;
        $payload['hero']['title'] = ['ar' => 'عنوان {accent}جديد{/accent}', 'en' => 'A {accent}new{/accent} title'];

        $this->actingAs($admin)->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => $payload])
            ->assertOk()
            ->assertJsonPath('status', 'published_with_draft')
            ->assertJsonPath('has_unpublished_changes', true)
            ->assertJsonPath('draft.hero.title.en', 'A {accent}new{/accent} title')
            ->assertJsonPath('payload.hero.title.en', $original['en']);

        // The public page still serves the live text.
        $this->assertSame($original['en'], $this->getJson('/api/pages/about')->json('data.blocks.design_copy.hero.title'));

        $this->actingAs($admin)->postJson('/api/admin/pages/blocks/'.$block->id.'/publish')
            ->assertOk()
            ->assertJsonPath('status', 'published')
            ->assertJsonPath('draft', null)
            ->assertJsonPath('payload.hero.title.ar', 'عنوان {accent}جديد{/accent}');

        $this->assertSame('A {accent}new{/accent} title', $this->getJson('/api/pages/about')->json('data.blocks.design_copy.hero.title'));
        $this->assertSame(
            ['draft_saved', 'content_block_published'],
            AuditLog::query()->where('subject_type', ContentBlock::class)->where('subject_id', $block->id)->orderBy('id')->pluck('action')->all(),
        );
    }

    public function test_discarding_a_draft_restores_the_live_text(): void
    {
        $admin = $this->admin();
        $block = $this->block('contact', 'design_copy');
        $payload = $block->payload;
        $payload['title']['en'] = 'Changed';

        $this->actingAs($admin)->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => $payload])->assertOk();
        $this->actingAs($admin)->postJson('/api/admin/pages/blocks/'.$block->id.'/discard-draft')
            ->assertOk()
            ->assertJsonPath('draft', null)
            ->assertJsonPath('status', 'published')
            ->assertJsonPath('payload.title.en', $block->payload['title']['en']);
    }

    public function test_a_payload_that_changes_the_block_shape_is_rejected(): void
    {
        $admin = $this->admin();
        $block = $this->block('home', 'service_highlights');

        $missing = $block->payload;
        unset($missing['items'][0]['title']);
        $this->actingAs($admin)->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => $missing])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['payload.items.0' => 'shape_mismatch']);

        $external = $block->payload;
        $external['items'][0]['href'] = 'https://example.com';
        $this->actingAs($admin)->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => $external])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['payload.items.0.href']);

        $this->actingAs($admin)->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => 'text'])->assertUnprocessable();
        $this->assertNull($this->actingAs($admin)->getJson('/api/admin/pages/blocks/'.$block->id)->json('draft'));
    }

    public function test_a_block_with_text_in_one_language_only_cannot_be_published(): void
    {
        $admin = $this->admin();
        $block = $this->block('media', 'design_copy');
        $payload = $block->payload;
        $payload['title']['en'] = '';

        $this->actingAs($admin)->patchJson('/api/admin/pages/blocks/'.$block->id, ['payload' => $payload])
            ->assertOk()
            ->assertJsonPath('publish_blockers.0.field', 'payload.title')
            ->assertJsonPath('publish_blockers.0.code', 'translation_missing');

        $this->actingAs($admin)->postJson('/api/admin/pages/blocks/'.$block->id.'/publish')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['payload.title']);
        $this->assertSame($block->payload['title']['en'], $block->fresh()->payload['title']['en']);
    }

    public function test_a_hero_slide_edit_is_drafted_then_published(): void
    {
        $admin = $this->admin();
        $slide = HeroSlide::query()->where('key', 'vision')->firstOrFail();

        $this->actingAs($admin)->getJson('/api/admin/pages/hero-slides')->assertOk()->assertJsonCount(14, 'data');
        $this->actingAs($admin)->patchJson('/api/admin/pages/hero-slides/'.$slide->id, ['headline' => ['ar' => 'رؤية جديدة', 'en' => 'A new vision']])
            ->assertOk()
            ->assertJsonPath('status', 'published_with_draft')
            ->assertJsonPath('draft.headline.en', 'A new vision')
            ->assertJsonPath('draft.subline.ar', $slide->subline['ar'])
            ->assertJsonPath('headline.en', $slide->headline['en']);
        $this->assertSame($slide->headline['ar'], $slide->fresh()->headline['ar']);

        $this->actingAs($admin)->postJson('/api/admin/pages/hero-slides/'.$slide->id.'/publish')
            ->assertOk()
            ->assertJsonPath('headline.en', 'A new vision')
            ->assertJsonPath('draft', null);

        $this->actingAs($admin)->patchJson('/api/admin/pages/hero-slides/'.$slide->id, ['headline' => ['ar' => 'رؤية', 'en' => '']])->assertOk();
        $this->actingAs($admin)->postJson('/api/admin/pages/hero-slides/'.$slide->id.'/publish')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['headline.en']);
        $this->actingAs($admin)->postJson('/api/admin/pages/hero-slides/'.$slide->id.'/discard-draft')->assertOk()->assertJsonPath('draft', null);
    }

    public function test_a_statistic_keeps_its_unit_and_is_published_to_the_home_api(): void
    {
        $admin = $this->admin();
        $statistic = Statistic::query()->where('key', 'project_volume')->firstOrFail();

        $this->actingAs($admin)->patchJson('/api/admin/pages/statistics/'.$statistic->id, [
            'value' => 16.5,
            'label' => ['ar' => 'حجم المشاريع', 'en' => 'Project volume'],
        ])
            ->assertOk()
            ->assertJsonPath('draft.value', 16.5)
            ->assertJsonPath('draft.scale', 'billion')
            ->assertJsonPath('draft.unit.en', 'SAR')
            ->assertJsonPath('value', 15);

        $this->actingAs($admin)->postJson('/api/admin/pages/statistics/'.$statistic->id.'/publish')
            ->assertOk()
            ->assertJsonPath('value', 16.5)
            ->assertJsonPath('status', 'published');

        $public = collect($this->getJson('/api/home')->json('data.statistics'))->firstWhere('key', 'project_volume');
        $this->assertSame(16.5, $public['value']);
        $this->assertSame('Project volume', $public['label']);

        $this->actingAs($admin)->patchJson('/api/admin/pages/statistics/'.$statistic->id, ['scale' => 'trillion'])->assertUnprocessable();
        $this->actingAs($admin)->patchJson('/api/admin/pages/statistics/'.$statistic->id, ['value' => -1])->assertUnprocessable();
        $this->actingAs($admin)->patchJson('/api/admin/pages/statistics/'.$statistic->id, ['key' => 'renamed'])->assertOk();
        $this->assertSame('project_volume', $statistic->fresh()->key);
    }

    public function test_home_sectors_default_to_the_built_in_five_until_an_order_is_published(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->getJson('/api/admin/pages/home-sectors')
            ->assertOk()
            ->assertJsonPath('slugs', HomeSectors::DEFAULT)
            ->assertJsonPath('is_default', true)
            ->assertJsonPath('max', 5)
            ->assertJsonCount(Sector::query()->published()->count(), 'sectors');
        $this->assertArrayNotHasKey('home_sectors', $this->getJson('/api/home')->json('data.blocks'));

        $order = ['health', 'education', 'government-buildings'];
        $this->actingAs($admin)->putJson('/api/admin/pages/home-sectors', ['slugs' => $order])
            ->assertOk()
            ->assertJsonPath('slugs', $order)
            ->assertJsonPath('is_default', false);

        $this->assertSame($order, $this->getJson('/api/home')->json('data.blocks.home_sectors.items'));
        $this->assertSame(1, ContentBlock::query()->where('section_key', HomeSectors::SECTION_KEY)->count());

        // The order block has its own editor and is not listed with the page blocks.
        $home = collect($this->actingAs($admin)->getJson('/api/admin/pages')->json('data.0.blocks'))->pluck('section_key');
        $this->assertFalse($home->contains(HomeSectors::SECTION_KEY));
    }

    public function test_home_sectors_must_be_distinct_published_sectors_within_the_limit(): void
    {
        $admin = $this->admin();
        Sector::query()->where('slug', 'universities')->update(['status' => PublicationStatus::Draft->value]);

        $this->actingAs($admin)->putJson('/api/admin/pages/home-sectors', ['slugs' => []])->assertUnprocessable();
        $this->actingAs($admin)->putJson('/api/admin/pages/home-sectors', ['slugs' => ['health', 'health']])->assertUnprocessable();
        $this->actingAs($admin)->putJson('/api/admin/pages/home-sectors', ['slugs' => ['health', 'no-such-sector']])->assertUnprocessable();
        $this->actingAs($admin)->putJson('/api/admin/pages/home-sectors', ['slugs' => ['health', 'universities']])->assertUnprocessable();
        $six = Sector::query()->published()->limit(6)->pluck('slug')->all();
        $this->assertCount(6, $six);
        $this->actingAs($admin)->putJson('/api/admin/pages/home-sectors', ['slugs' => $six])->assertUnprocessable();
        $this->assertNull(HomeSectors::block());
    }

    private function block(string $page, string $section): ContentBlock
    {
        return ContentBlock::query()->where('page', $page)->where('section_key', $section)->firstOrFail();
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }

    /**
     * @param  list<string>  $permissions
     */
    private function editorWithout(array $permissions): User
    {
        $role = Role::findByName(EditorRole::NAME, EditorRole::GUARD);
        foreach ($permissions as $permission) {
            $role->revokePermissionTo($permission);
        }
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $editor = User::factory()->create();
        $editor->assignRole(EditorRole::NAME);

        return $editor;
    }
}

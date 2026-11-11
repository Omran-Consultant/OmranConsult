<?php

namespace Tests\Feature\Content;

use App\Models\User;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\ContentBlocks;
use App\Support\Content\PublicationStatus;
use App\Support\SuperAdminRole;
use Database\Seeders\Demo\DemoProjectContentSeeder;
use Database\Seeders\Profile\ProfileContentSeeder;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class DemoProjectContentSeederTest extends TestCase
{
    use RefreshDatabase;

    private const SLUG = 'cop16-technical-audit';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SuperAdminRoleSeeder::class);
        $this->seed(ProfileContentSeeder::class);
    }

    public function test_it_fills_every_project_in_the_normal_fields_and_flags_it(): void
    {
        $this->seed(DemoProjectContentSeeder::class);

        $this->assertSame(26, Project::query()->where('has_demo_content', true)->count());

        Project::query()->get()->each(function (Project $project): void {
            $this->assertCount(2, $project->overview['ar'], $project->slug);
            $this->assertSame('paragraph', $project->overview['en'][0]['type']);
            $this->assertSame($project->overview['ar'], ContentBlocks::validate($project->overview['ar'], 'overview.ar'));
            $this->assertGreaterThanOrEqual(4, count($project->scope['ar']));
            $this->assertLessThanOrEqual(6, count($project->scope['ar']));
            $this->assertCount(count($project->scope['ar']), $project->scope['en']);
            $this->assertNotEmpty($project->service_type['ar']);
            $this->assertGreaterThanOrEqual(3, count($project->gallery));
            $this->assertNull($project->year);
            $this->assertNull($project->delivery_status);
            foreach (array_slice($project->gallery, 1) as $image) {
                $this->assertNotSame('', $image['alt']['ar'], $project->slug.' '.$image['key']);
                $this->assertNotSame('', $image['alt']['en'], $project->slug.' '.$image['key']);
            }
        });
    }

    public function test_it_is_idempotent(): void
    {
        $this->seed(DemoProjectContentSeeder::class);
        $first = Project::query()->with('regions')->orderBy('id')->get()->map(fn (Project $project) => $this->snapshot($project));

        $this->seed(DemoProjectContentSeeder::class);
        $second = Project::query()->with('regions')->orderBy('id')->get()->map(fn (Project $project) => $this->snapshot($project));

        $this->assertSame($first->all(), $second->all());
    }

    public function test_it_never_overwrites_real_values(): void
    {
        $project = Project::query()->where('slug', self::SLUG)->firstOrFail();
        $real = [['type' => 'paragraph', 'children' => [['text' => 'نص حقيقي']]]];
        $project->forceFill([
            'overview' => ['ar' => $real, 'en' => []],
            'scope' => ['ar' => ['بند حقيقي'], 'en' => []],
            'service_type' => ['ar' => 'خدمة حقيقية', 'en' => 'Real service'],
            'gallery' => ['wave', 'truss'],
        ])->save();

        $this->seed(DemoProjectContentSeeder::class);

        $project->refresh();
        $this->assertSame($real, $project->overview['ar']);
        $this->assertSame([], $project->overview['en']);
        $this->assertSame(['بند حقيقي'], $project->scope['ar']);
        $this->assertSame('خدمة حقيقية', $project->service_type['ar']);
        $this->assertSame(['wave', 'truss'], array_column($project->gallery, 'key') ?: $project->gallery);
        $this->assertFalse($project->has_demo_content);
    }

    public function test_it_keeps_the_real_cover_first(): void
    {
        $this->seed(DemoProjectContentSeeder::class);

        $gallery = Project::query()->where('slug', self::SLUG)->firstOrFail()->gallery;

        $this->assertSame('wave', $gallery[0]['key'] ?? $gallery[0]);
    }

    public function test_saving_a_draft_keeps_the_flag_and_publishing_from_the_dashboard_clears_it(): void
    {
        Bus::fake();
        $this->seed(DemoProjectContentSeeder::class);
        $project = Project::query()->where('slug', self::SLUG)->firstOrFail();

        $this->actingAs($this->admin())
            ->getJson('/api/admin/projects/'.$project->id)
            ->assertOk()
            ->assertJsonPath('has_demo_content', true);

        // «حفظ مسودة» on a published project: the live row still shows the demo content.
        $this->actingAs($this->admin())
            ->patchJson('/api/admin/projects/'.$project->id, ['service_type' => ['ar' => 'تعديل', 'en' => 'Edited']])
            ->assertOk()
            ->assertJsonPath('has_demo_content', true);
        $this->assertTrue($project->fresh()->has_demo_content);

        $this->actingAs($this->admin())
            ->postJson('/api/admin/projects/'.$project->id.'/publish')
            ->assertOk()
            ->assertJsonPath('has_demo_content', false);
        $this->assertFalse($project->fresh()->has_demo_content);
    }

    public function test_saving_an_unpublished_project_keeps_the_flag(): void
    {
        $this->seed(DemoProjectContentSeeder::class);
        $project = Project::query()->where('slug', self::SLUG)->firstOrFail();
        $project->forceFill(['status' => PublicationStatus::Draft])->save();

        $this->actingAs($this->admin())
            ->patchJson('/api/admin/projects/'.$project->id, ['service_type' => ['ar' => 'تعديل', 'en' => 'Edited']])
            ->assertOk()
            ->assertJsonPath('has_demo_content', true);

        $this->assertTrue($project->fresh()->has_demo_content);
    }

    public function test_the_public_api_never_exposes_the_flag(): void
    {
        $this->seed(DemoProjectContentSeeder::class);

        $detail = $this->getJson('/api/projects/'.self::SLUG)->assertOk()->json('data');
        $list = $this->getJson('/api/projects?per_page=100')->assertOk()->json('data');

        $this->assertArrayNotHasKey('has_demo_content', $detail);
        $this->assertArrayNotHasKey('has_demo_content', $list[0]);
        $this->assertCount(2, $detail['overview']);
    }

    /**
     * @return array<string, mixed>
     */
    private function snapshot(Project $project): array
    {
        return [
            ...$project->only(['slug', 'overview', 'scope', 'gallery', 'location', 'service_type', 'has_demo_content']),
            'regions' => $project->regions->modelKeys(),
        ];
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

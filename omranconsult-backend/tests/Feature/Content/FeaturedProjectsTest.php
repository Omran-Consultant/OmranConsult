<?php

namespace Tests\Feature\Content;

use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Design\FeaturedProjectsSeeder;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Home featured projects and their images (SDD §6.7 P24, PHASE4C_HOME_REVIEW H3).
 */
class FeaturedProjectsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    public function test_featured_returns_the_design_picks_in_order(): void
    {
        $data = collect($this->getJson('/api/projects?featured=1')->assertOk()->json('data'));

        $this->assertSame([
            'school-buildings-contracts-supervision-central-and-northern',
            'king-saud-university-operation-and-maintenance-efficiency',
            'dam-projects-consulting-services',
            'cop16-technical-audit',
            'king-abdulaziz-hospital-site-development',
            'central-veterinary-laboratory-dhurma',
        ], $data->pluck('slug')->all());
        $this->assertSame(['riyadh_teal', 'tablet', 'aerial', 'wave', 'facade', 'site'], $data->pluck('image')->all());
    }

    public function test_featured_combines_with_sector(): void
    {
        $slugs = collect($this->getJson('/api/projects?featured=1&sector=health')->json('data'))->pluck('slug');

        $this->assertSame(['king-abdulaziz-hospital-site-development'], $slugs->all());
    }

    public function test_unpublished_featured_project_is_hidden(): void
    {
        Project::query()->where('slug', 'cop16-technical-audit')->update(['status' => PublicationStatus::Draft->value]);

        $this->assertCount(5, $this->getJson('/api/projects?featured=1')->json('data'));
    }

    public function test_only_one_is_accepted_for_featured(): void
    {
        $this->getJson('/api/projects?featured=yes')->assertUnprocessable()->assertJsonValidationErrors('featured');
    }

    public function test_every_project_has_an_image_and_rows_of_three_do_not_repeat_one(): void
    {
        $this->assertCount(26, FeaturedProjectsSeeder::IMAGES);

        $images = collect($this->getJson('/api/projects?per_page=100')->json('data'))->pluck('image');
        $this->assertNotContains(null, $images->all());
        foreach ($images->chunk(3) as $row) {
            $this->assertSame($row->count(), $row->unique()->count(), 'A grid row repeats an image: '.$row->implode(', '));
        }

        foreach (collect($this->getJson('/api/sectors')->json('data'))->pluck('slug') as $sector) {
            $sectorImages = collect($this->getJson("/api/projects?per_page=100&sector={$sector}")->json('data'))->pluck('image');
            $this->assertSame($sectorImages->count(), $sectorImages->unique()->count(), "Sector {$sector} repeats an image.");
        }
    }
}

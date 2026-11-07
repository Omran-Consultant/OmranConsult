<?php

namespace Tests\Feature\Content;

use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Database\Seeders\Profile\SectorsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sectors and project filtering by sector and search (SDD §6.7 P17, §7.1).
 */
class SectorsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    public function test_sectors_list_in_design_order_with_counts(): void
    {
        $sectors = collect($this->getJson('/api/sectors', ['Accept-Language' => 'ar'])->assertOk()->json('data'));

        $this->assertSame(
            ['education', 'health', 'water-and-environment', 'infrastructure', 'universities', 'government-buildings', 'culture-and-sport', 'facilities-and-real-estate'],
            $sectors->pluck('slug')->all(),
        );
        $this->assertSame('التعليم', $sectors->first()['name']);
        $this->assertSame(26, $sectors->sum('projects_count'));
        $this->assertSame(9, $sectors->firstWhere('slug', 'water-and-environment')['projects_count']);
    }

    public function test_every_profile_project_has_exactly_one_sector(): void
    {
        $slugs = SectorsSeeder::assignedProjectSlugs();

        $this->assertCount(26, $slugs);
        $this->assertSame(count($slugs), count(array_unique($slugs)));
        $this->assertSame(0, Project::query()->whereNull('sector_id')->count());
    }

    public function test_project_list_exposes_sector(): void
    {
        $project = collect($this->getJson('/api/projects?per_page=100', ['Accept-Language' => 'en'])->json('data'))
            ->firstWhere('slug', 'cop16-technical-audit');

        $this->assertSame(['slug' => 'water-and-environment', 'name' => 'Water and Environment'], $project['sector']);
    }

    public function test_projects_filter_by_sector(): void
    {
        $slugs = collect($this->getJson('/api/projects?sector=universities')->assertOk()->json('data'))->pluck('slug');

        $this->assertSame(
            ['king-faisal-university-operation-and-maintenance-efficiency', 'king-saud-university-operation-and-maintenance-efficiency'],
            $slugs->all(),
        );
    }

    public function test_unknown_or_unpublished_sector_returns_no_projects(): void
    {
        Sector::query()->where('slug', 'health')->update(['status' => PublicationStatus::Draft->value]);

        $this->assertSame([], $this->getJson('/api/projects?sector=health')->json('data'));
        $this->assertSame([], $this->getJson('/api/projects?sector=nope')->json('data'));
        $this->assertNotContains('health', collect($this->getJson('/api/sectors')->json('data'))->pluck('slug'));
    }

    public function test_search_matches_arabic_title(): void
    {
        $slugs = collect($this->getJson('/api/projects?q='.urlencode('سدود'))->assertOk()->json('data'))->pluck('slug');

        $this->assertEqualsCanonicalizing(
            ['dams-operation-and-maintenance-efficiency-consulting', 'dam-projects-consulting-services'],
            $slugs->all(),
        );
    }

    public function test_search_is_case_insensitive_in_english(): void
    {
        $slugs = collect($this->getJson('/api/projects?q=cop16')->json('data'))->pluck('slug');

        $this->assertSame(['cop16-technical-audit'], $slugs->all());
    }

    public function test_search_matches_owner_name_in_either_locale(): void
    {
        $byEnglish = collect($this->getJson('/api/projects?q=red+crescent')->json('data'))->pluck('slug');
        $byArabic = collect($this->getJson('/api/projects?q='.urlencode('الهلال الأحمر'))->json('data'))->pluck('slug');

        $this->assertSame(['ambulance-centers-design-and-supervision'], $byEnglish->all());
        $this->assertSame($byEnglish->all(), $byArabic->all());
    }

    public function test_search_combines_with_sector_filter(): void
    {
        $slugs = collect($this->getJson('/api/projects?sector=water-and-environment&q='.urlencode('الصيانة'))->json('data'))->pluck('slug');

        $this->assertSame(
            ['mewa-operation-and-maintenance-efficiency-consulting', 'dams-operation-and-maintenance-efficiency-consulting'],
            $slugs->all(),
        );
    }

    public function test_search_treats_wildcards_literally(): void
    {
        $this->assertSame([], $this->getJson('/api/projects?q=%25%25')->assertOk()->json('data'));
        $this->assertSame([], $this->getJson('/api/projects?q=__')->assertOk()->json('data'));
    }

    public function test_search_requires_two_characters(): void
    {
        $this->getJson('/api/projects?q=a')->assertUnprocessable()->assertJsonValidationErrors('q');
    }
}

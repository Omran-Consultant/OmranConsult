<?php

namespace Tests\Feature\Content;

use App\Modules\Projects\Domain\DeliveryStatus;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Optional project facts, cover image key and related projects (SDD §6.7 P18, §7.1).
 */
class ProjectOptionalFieldsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    public function test_profile_projects_have_null_optional_facts(): void
    {
        $data = $this->getJson('/api/projects/cop16-technical-audit')->assertOk()->json('data');

        $this->assertNull($data['year']);
        $this->assertNull($data['location']);
        $this->assertNull($data['service_type']);
        $this->assertNull($data['delivery_status']);
        $this->assertNull($data['overview']);
        $this->assertSame([], $data['scope']);
        $this->assertSame('wave', $data['gallery'][0]['key']);
        $this->assertNull($data['gallery'][0]['media_id']);
    }

    public function test_image_is_the_first_gallery_image(): void
    {
        $list = collect($this->getJson('/api/projects?per_page=100')->json('data'))->keyBy('slug');

        $this->assertSame('wave', $list['cop16-technical-audit']['image']);
        $this->assertSame('tablet', $list['king-saud-university-operation-and-maintenance-efficiency']['image']);
        $this->assertNull($list['cop16-technical-audit']['year']);
    }

    public function test_image_falls_back_to_the_sector_default(): void
    {
        Project::query()->where('slug', 'cop16-technical-audit')->update(['gallery' => null]);

        $list = collect($this->getJson('/api/projects?per_page=100')->json('data'))->keyBy('slug');

        $this->assertSame('aerial', $list['cop16-technical-audit']['image']);
    }

    public function test_optional_facts_resolve_to_the_requested_locale(): void
    {
        Project::query()->where('slug', 'cop16-technical-audit')->firstOrFail()->update([
            'year' => 2024,
            'location' => ['ar' => 'الرياض', 'en' => 'Riyadh'],
            'service_type' => ['ar' => 'تدقيق فني', 'en' => 'Technical audit'],
            'delivery_status' => DeliveryStatus::Completed,
            'overview' => ['ar' => 'نظرة', 'en' => 'Overview'],
            'scope' => ['ar' => ['بند'], 'en' => ['Item', '']],
            'gallery' => ['wave', 'night'],
        ]);

        $ar = $this->getJson('/api/projects/cop16-technical-audit', ['Accept-Language' => 'ar'])->json('data');
        $en = $this->getJson('/api/projects/cop16-technical-audit', ['Accept-Language' => 'en'])->json('data');

        $this->assertSame(2024, $ar['year']);
        $this->assertSame('الرياض', $ar['location']);
        $this->assertSame('Technical audit', $en['service_type']);
        $this->assertSame('completed', $en['delivery_status']);
        $this->assertSame(['بند'], $ar['scope']);
        $this->assertSame(['Item'], $en['scope']);
        $this->assertSame('نظرة', $ar['overview'][0]['children'][0]['text']);
        $this->assertSame('Overview', $en['overview'][0]['children'][0]['text']);
        $this->assertSame('wave', $en['gallery'][0]['key']);
        $this->assertSame('night', $en['gallery'][1]['key']);
        $this->assertSame('wave', $en['image']);
    }

    public function test_related_prefers_same_sector_then_same_owner(): void
    {
        $related = collect($this->getJson('/api/projects/king-saud-university-operation-and-maintenance-efficiency')->json('data.related'))->pluck('slug');

        // One other university project (same sector), then Bin Jarallah's other projects (same owner).
        $this->assertSame([
            'king-faisal-university-operation-and-maintenance-efficiency',
            'al-hayat-national-hospitals-operation-and-maintenance-supervision',
            'bin-jarallah-facility-management-technical-support',
        ], $related->all());
    }

    public function test_related_excludes_the_project_and_unpublished_rows(): void
    {
        Project::query()->where('slug', 'dams-operation-and-maintenance-efficiency-consulting')
            ->update(['status' => PublicationStatus::Draft->value]);

        $related = collect($this->getJson('/api/projects/cop16-technical-audit')->json('data.related'))->pluck('slug');

        $this->assertCount(3, $related);
        $this->assertNotContains('cop16-technical-audit', $related);
        $this->assertNotContains('dams-operation-and-maintenance-efficiency-consulting', $related);
    }
}

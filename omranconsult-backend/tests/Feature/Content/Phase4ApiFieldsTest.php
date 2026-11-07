<?php

namespace Tests\Feature\Content;

use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase4ApiFieldsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    public function test_experts_expose_stable_slugs(): void
    {
        $response = $this->getJson('/api/experts')->assertOk();

        $this->assertSame(
            [
                'mohammed-mosaad',
                'bassam-jouriyeh',
                'mohammed-abdelalim',
                'abdulrahman-al-muqbil',
                'waseem-asfahan',
                'amira-al-burtuqali',
            ],
            collect($response->json('data'))->pluck('slug')->all(),
        );
    }

    public function test_org_chart_person_includes_slug(): void
    {
        $ceo = collect($this->getJson('/api/org-chart')->json('data'))
            ->firstWhere('title', 'Chief Executive Officer');

        $this->assertSame('hussein', $ceo['person']['slug']);
    }

    public function test_service_categories_expose_kind(): void
    {
        $categories = collect($this->getJson('/api/services')->json('data'));

        $this->assertSame(3, $categories->where('kind', 'axis')->count());
        $this->assertSame('asset_management', $categories->firstWhere('slug', 'asset-management-services')['kind']);
        $this->assertSame('engineering_design', $categories->firstWhere('slug', 'engineering-and-design')['kind']);
    }

    public function test_home_exposes_section_titles_block(): void
    {
        $block = $this->getJson('/api/home', ['Accept-Language' => 'ar'])
            ->assertOk()
            ->json('data.blocks.section_titles');

        $this->assertSame('أرقام وتواريخ شركة العمران المتقدم', $block['statistics']);
        $this->assertSame('خبراء شركة العمران المتقدم', $block['experts']);
        $this->assertSame('الهيكل التنظيمي', $block['org_chart']);
        $this->assertSame('مجلس الإدارة', $block['org_groups']['board']);
    }
}

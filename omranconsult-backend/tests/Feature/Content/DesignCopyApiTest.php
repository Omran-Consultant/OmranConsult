<?php

namespace Tests\Feature\Content;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Content\Presentation\Http\Controllers\PagesController;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Design copy blocks, service highlights and design-related disputes (SDD §6.7 P22, PHASE4C D4, Q13, Q15).
 */
class DesignCopyApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    public function test_home_design_copy_keeps_the_accent_marker(): void
    {
        $copy = $this->getJson('/api/home', ['Accept-Language' => 'ar'])->assertOk()->json('data.blocks.design_copy');

        $this->assertSame("نبني {accent}كفاءة{/accent} الأصول\nلمستقبل مستدام", $copy['hero']['headline']);
        $this->assertSame('استكشف مشاريعنا', $copy['hero']['cta_primary']);
        $this->assertSame('OMRAN ADVANCED COMPANY', $copy['hero']['overline']);
    }

    public function test_english_design_copy_is_present(): void
    {
        $copy = $this->getJson('/api/home', ['Accept-Language' => 'en'])->json('data.blocks.design_copy');

        $this->assertSame("Building asset {accent}efficiency{/accent}\nfor a sustainable future", $copy['hero']['headline']);
        $this->assertCount(3, $copy['about']['features']);
    }

    public function test_six_service_highlights_in_order(): void
    {
        $items = $this->getJson('/api/home', ['Accept-Language' => 'ar'])->json('data.blocks.service_highlights.items');

        $this->assertSame(['01', '02', '03', '04', '05', '06'], array_column($items, 'number'));
        $this->assertSame('إدارة الأصول والمرافق', $items[0]['title']);
        $this->assertSame('/services#asset-management', $items[0]['href']);
        $this->assertSame('building', $items[0]['icon']);
    }

    public function test_every_page_has_design_copy(): void
    {
        foreach (PagesController::PAGES as $page) {
            $this->getJson("/api/pages/{$page}", ['Accept-Language' => 'ar'])
                ->assertOk()
                ->assertJsonPath('locale', 'ar')
                ->assertJsonStructure(['data' => ['blocks' => ['design_copy']]]);
        }

        $this->assertSame('أرسل استفسارك', $this->getJson('/api/pages/contact', ['Accept-Language' => 'ar'])->json('data.blocks.design_copy.form_title'));
    }

    public function test_unknown_page_is_not_found(): void
    {
        $this->getJson('/api/pages/admin')->assertNotFound()->assertJsonPath('message', 'Not found.');
    }

    public function test_unpublished_design_copy_is_hidden(): void
    {
        ContentBlock::query()->where('page', 'contact')->update(['status' => PublicationStatus::Draft->value]);

        $this->assertSame([], (array) $this->getJson('/api/pages/contact')->json('data.blocks'));
    }

    public function test_fact_statistics_for_the_hero_and_about(): void
    {
        $stats = collect($this->getJson('/api/home', ['Accept-Language' => 'ar'])->json('data.statistics'))->keyBy('key');

        $this->assertEquals(21, $stats['years_experience']['value']);
        $this->assertSame('+', $stats['group_experience']['suffix']);
        $this->assertEquals(50, $stats['group_experience']['value']);
        $this->assertSame(['completed_projects', 'project_volume', 'employees', 'local_content', 'partnerships'], $stats->keys()->take(5)->all());
    }

    public function test_every_design_copy_block_has_a_review_dispute(): void
    {
        $blocks = ContentBlock::query()->whereIn('section_key', ['design_copy', 'service_highlights'])->get();

        $this->assertCount(8, $blocks);
        foreach ($blocks as $block) {
            $this->assertTrue(
                ContentDispute::query()->where('subject_type', $block->getMorphClass())->where('subject_id', $block->id)->where('issue_code', 'design_copy_review')->exists(),
                "No design_copy_review dispute for {$block->page}/{$block->section_key}.",
            );
        }
    }

    public function test_existing_disputes_record_the_design_suggestion(): void
    {
        $esg = ContentBlock::query()->where('section_key', 'esg')->firstOrFail();
        $dispute = ContentDispute::query()->where('subject_type', $esg->getMorphClass())->where('subject_id', $esg->id)
            ->where('field_path', 'payload.pillars.1.title')->firstOrFail();

        $this->assertSame('الحوكمة', $dispute->reference_snapshot['design_suggests']);
        $this->assertStringContainsString('Design suggests', $dispute->description);
        $this->assertSame(9, ContentDispute::query()->get()->filter(fn (ContentDispute $d): bool => isset($d->reference_snapshot['design_suggests']) && $d->issue_code !== 'EDITORIAL_DESIGN_DIFFERS')->count());
    }

    public function test_coverage_figure_is_linked_to_the_conflicting_stats_dispute(): void
    {
        $this->assertTrue(ContentDispute::query()
            ->where('field_path', 'payload.coverage.subtitle')
            ->where('issue_code', 'EDITORIAL_CONFLICTING_STATS')
            ->exists());
    }
}

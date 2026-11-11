<?php

namespace Tests\Feature\Content;

use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * News categories, list and article (SDD §6.7 P21, §7.1).
 */
class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    public function test_categories_follow_the_design_tab_order(): void
    {
        $names = collect($this->getJson('/api/news-categories', ['Accept-Language' => 'ar'])->assertOk()->json('data'))->pluck('name');

        $this->assertSame(['أخبار الشركة', 'المشاريع', 'الفعاليات', 'مقالات'], $names->all());
    }

    public function test_list_is_newest_first_and_marks_demo_posts(): void
    {
        $response = $this->getJson('/api/news?per_page=50', ['Accept-Language' => 'en'])->assertOk();
        $posts = collect($response->json('data'));

        $this->assertSame(8, $response->json('meta.total'));
        $this->assertSame('osool-360-platform-launch', $posts->first()['slug']);
        $this->assertSame('omran-cop16-technical-audit', $posts->last()['slug']);
        $this->assertTrue($posts->every(fn (array $post): bool => $post['is_demo'] === true));
        $this->assertSame('2026-10-01', $posts->first()['date']);
        $this->assertSame(['slug' => 'company-news', 'name' => 'Company news'], $posts->first()['category']);
    }

    public function test_default_page_size_is_six(): void
    {
        $this->assertCount(6, $this->getJson('/api/news')->json('data'));
    }

    public function test_featured_filter(): void
    {
        $featured = collect($this->getJson('/api/news?featured=1')->json('data'))->pluck('slug');
        $others = collect($this->getJson('/api/news?featured=0&per_page=50')->json('data'))->pluck('slug');

        $this->assertSame(['omran-cop16-technical-audit'], $featured->all());
        $this->assertCount(7, $others);
        $this->assertNotContains('omran-cop16-technical-audit', $others);
    }

    public function test_category_filter(): void
    {
        $slugs = collect($this->getJson('/api/news?category=company-news')->json('data'))->pluck('slug');

        $this->assertSame(['osool-360-platform-launch', 'partnerships-with-international-firms'], $slugs->all());
    }

    public function test_article_returns_blocks_tags_author_and_related(): void
    {
        $data = $this->getJson('/api/news/omran-cop16-technical-audit', ['Accept-Language' => 'ar'])->assertOk()->json('data');

        $this->assertSame('فريق الاتصال المؤسسي', $data['author']);
        $this->assertSame(['COP16', 'التدقيق الفني', 'البيئة', 'الرياض'], $data['tags']);
        $this->assertSame(['paragraph', 'paragraph', 'heading', 'paragraph', 'quote', 'image', 'image', 'paragraph'], array_column($data['body'], 'type'));
        $this->assertSame('control', $data['body'][5]['image']);
        // Same category (projects) first, newest first.
        $this->assertSame(
            ['school-facilities-supervision-framework-agreement', 'king-saud-university-operations-efficiency', 'dam-projects-jazan-asir-najran'],
            collect($data['related'])->pluck('slug')->all(),
        );
    }

    public function test_posts_without_a_design_body_return_no_blocks(): void
    {
        $data = $this->getJson('/api/news/osool-360-platform-launch')->assertOk()->json('data');

        $this->assertSame([], $data['body']);
        $this->assertSame([], $data['tags']);
        $this->assertNull($data['author']);
        $this->assertCount(3, $data['related']);
    }

    public function test_unknown_block_types_are_dropped(): void
    {
        NewsPost::query()->where('slug', 'osool-360-platform-launch')->update([
            'body' => json_encode(['en' => [['type' => 'html', 'text' => '<b>x</b>'], ['type' => 'paragraph', 'text' => 'Kept']], 'ar' => []]),
        ]);

        $body = $this->getJson('/api/news/osool-360-platform-launch')->json('data.body');
        $this->assertSame(['paragraph'], array_column($body, 'type'));
        $this->assertSame('Kept', $body[0]['text']);
    }

    public function test_editor_blocks_keep_lists_heading_levels_and_marks(): void
    {
        NewsPost::query()->where('slug', 'osool-360-platform-launch')->firstOrFail()->update([
            'body' => ['en' => [
                ['type' => 'heading', 'level' => 'h3', 'children' => [['text' => 'Sub']]],
                ['type' => 'paragraph', 'children' => [['text' => 'Plain '], ['text' => 'bold', 'bold' => true], ['text' => 'site', 'href' => 'https://omranconsult.com']]],
                ['type' => 'list', 'style' => 'number', 'items' => [[['text' => 'One']], [['text' => 'Two', 'italic' => true]]]],
            ], 'ar' => []],
        ]);

        $body = $this->getJson('/api/news/osool-360-platform-launch')->assertOk()->json('data.body');

        $this->assertSame(['heading', 'paragraph', 'list'], array_column($body, 'type'));
        $this->assertSame('h3', $body[0]['level']);
        $this->assertSame('Sub', $body[0]['text']);
        $this->assertSame([['text' => 'Plain '], ['text' => 'bold', 'bold' => true], ['text' => 'site', 'href' => 'https://omranconsult.com']], $body[1]['children']);
        $this->assertSame('Plain boldsite', $body[1]['text']);
        $this->assertSame('number', $body[2]['style']);
        $this->assertSame([[['text' => 'One']], [['text' => 'Two', 'italic' => true]]], $body[2]['items']);
        $this->assertSame("One\nTwo", $body[2]['text']);
    }

    public function test_unpublished_post_is_not_found(): void
    {
        NewsPost::query()->where('slug', 'osool-360-platform-launch')->update(['status' => PublicationStatus::Draft->value]);

        $this->getJson('/api/news/osool-360-platform-launch')->assertNotFound()->assertJsonPath('message', 'Not found.');
    }

    public function test_demo_content_dispute_is_recorded(): void
    {
        $this->assertSame(1, ContentDispute::query()->where('issue_code', 'demo_content')->where('subject_type', (new NewsPost)->getMorphClass())->count());
    }
}

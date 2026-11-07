<?php

namespace Tests\Feature\Content;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Cross-endpoint guarantees of the public read API (SDD §7.1).
 */
class PublicApiContractTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Keys that belong to the CMS, never to a public response.
     */
    private const INTERNAL_KEYS = [
        'disputes', 'status', 'deleted_at', 'created_by', 'updated_by', 'created_at', 'updated_at',
        'published_at', 'sort_order', 'issue_code', 'dispute_class', 'field_path', 'reference_snapshot',
        'resolution_reason', 'rejection_reason', 'resolved_by', 'notes',
    ];

    private int $published = 0;

    public function test_home_query_count_does_not_grow_with_records(): void
    {
        $this->createHomeRecords(2);
        $withTwo = $this->countQueries('/api/home');

        $this->createHomeRecords(8);
        $withTen = $this->countQueries('/api/home');

        $this->assertSame(10, count($this->getJson('/api/home')->json('data.hero_slides')));
        $this->assertSame($withTwo, $withTen, "GET /api/home ran {$withTwo} queries with 2 records and {$withTen} with 10.");
    }

    public function test_projects_query_count_does_not_grow_with_records(): void
    {
        $this->createProjects(2);
        $withTwo = $this->countQueries('/api/projects?per_page=100');

        $this->createProjects(8);
        $withTen = $this->countQueries('/api/projects?per_page=100');

        $response = $this->getJson('/api/projects?per_page=100');
        $this->assertCount(10, $response->json('data'));
        $this->assertNotNull($response->json('data.9.client'));
        $this->assertCount(1, $response->json('data.9.regions'));
        $this->assertSame($withTwo, $withTen, "GET /api/projects ran {$withTwo} queries with 2 records and {$withTen} with 10.");
    }

    public function test_unknown_project_returns_json_404_even_for_html_clients(): void
    {
        $this->seed(ProfileContentSeeder::class);

        $response = $this->get('/api/projects/does-not-exist', ['Accept' => 'text/html']);

        $response->assertNotFound();
        $this->assertStringContainsString('application/json', (string) $response->headers->get('Content-Type'));
        $this->assertStringNotContainsString('<html', strtolower((string) $response->getContent()));
        $this->assertSame('Not found.', $response->json('message'));
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function publicEndpoints(): array
    {
        return array_map(fn (string $path): array => [$path], [
            'settings' => '/api/settings',
            'home' => '/api/home',
            'services' => '/api/services',
            'projects' => '/api/projects?per_page=100',
            'project' => '/api/projects/cop16-technical-audit',
            'clients' => '/api/clients',
            'regions' => '/api/regions',
            'experts' => '/api/experts',
            'org chart' => '/api/org-chart',
            'documents' => '/api/documents',
            'partners' => '/api/partners',
            'sectors' => '/api/sectors',
            'news categories' => '/api/news-categories',
            'news' => '/api/news?per_page=50',
            'news post' => '/api/news/omran-cop16-technical-audit',
        ]);
    }

    #[DataProvider('publicEndpoints')]
    public function test_public_response_has_no_internal_fields(string $path): void
    {
        $this->seed(ProfileContentSeeder::class);

        foreach (['en', 'ar'] as $locale) {
            $data = $this->getJson($path, ['Accept-Language' => $locale])->assertOk()->json('data');
            $leaked = array_values(array_intersect(self::INTERNAL_KEYS, $this->keysOf($data)));

            $this->assertSame([], $leaked, "{$path} ({$locale}) exposes internal fields.");
        }
    }

    private function countQueries(string $path): int
    {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson($path)->assertOk();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $count;
    }

    private function createHomeRecords(int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $n = ++$this->published;
            HeroSlide::create(['key' => "slide-{$n}", 'headline' => $this->text("Slide {$n}"), ...$this->publishedState($n)]);
            Statistic::create(['key' => "stat-{$n}", 'value' => $n, 'label' => $this->text("Stat {$n}"), ...$this->publishedState($n)]);
            ContentBlock::create(['page' => 'home', 'section_key' => "block_{$n}", 'payload' => ['section_title' => $this->text("Block {$n}")], ...$this->publishedState($n)]);
        }
    }

    private function createProjects(int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $n = ++$this->published;
            $client = Client::create(['slug' => "client-{$n}", 'name' => $this->text("Client {$n}"), ...$this->publishedState($n)]);
            $region = Region::create(['slug' => "region-{$n}", 'name' => $this->text("Region {$n}"), ...$this->publishedState($n)]);
            $project = Project::create(['slug' => "project-{$n}", 'client_id' => $client->id, 'title' => $this->text("Project {$n}"), ...$this->publishedState($n)]);
            $project->regions()->attach($region->id);
        }
    }

    /**
     * @return array{ar: string, en: string}
     */
    private function text(string $en): array
    {
        return ['ar' => "نص {$en}", 'en' => $en];
    }

    /**
     * @return array{sort_order: int, status: string, published_at: Carbon}
     */
    private function publishedState(int $order): array
    {
        return ['sort_order' => $order, 'status' => PublicationStatus::Published->value, 'published_at' => now()];
    }

    /**
     * @return list<string>
     */
    private function keysOf(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $keys = [];
        foreach ($value as $key => $child) {
            if (is_string($key)) {
                $keys[] = $key;
            }
            array_push($keys, ...$this->keysOf($child));
        }

        return array_values(array_unique($keys));
    }
}

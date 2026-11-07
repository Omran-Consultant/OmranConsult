<?php

namespace Tests\Feature\Content;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Modules\Documents\Infrastructure\Models\Document;
use App\Modules\Partners\Infrastructure\Models\Partner;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use App\Modules\Team\Infrastructure\Models\OrgPosition;
use App\Modules\Team\Infrastructure\Models\TeamMember;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProfileContentSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
    }

    /**
     * Counts from docs/PROFILE_INVENTORY.md.
     *
     * @return array<string, array{0: string, 1: int}>
     */
    public static function profileCounts(): array
    {
        return [
            'site settings' => ['site_settings', 2],
            'hero and section dividers (§3.1)' => ['hero_slides', 14],
            // §3.4 (5) + years_experience and group_experience from the profile text (P22).
            'statistics (§3.4 + 2 text facts)' => ['statistics', 7],
            // 12 profile blocks + 7 design copy pages + home service highlights (P22).
            'content blocks (12 profile + 8 design)' => ['content_blocks', 20],
            'service categories (3 axes + 2)' => ['service_categories', 5],
            'services (24 + 10 + 12)' => ['services', 46],
            'clients (30 + Bin Jarallah owner)' => ['clients', 31],
            'regions (§3.7)' => ['regions', 11],
            'projects (§3.6)' => ['projects', 26],
            'project regions (none in profile)' => ['project_region', 0],
            'people (6 experts + 21 org chart)' => ['team_members', 27],
            'org chart boxes (§3.19)' => ['org_positions', 29],
            'documents (5 licenses + 8 ISO)' => ['documents', 13],
            'partners (§3.20)' => ['partners', 4],
        ];
    }

    #[DataProvider('profileCounts')]
    public function test_seeder_imports_every_profile_record(string $table, int $expected): void
    {
        $this->assertSame($expected, DB::table($table)->count());
    }

    public function test_services_are_grouped_as_in_the_profile(): void
    {
        $counts = ServiceCategory::query()->withCount('services')->orderBy('sort_order')->pluck('services_count', 'slug')->all();

        $this->assertSame([
            'engineering-consulting' => 9,
            'project-management-and-technical-support' => 9,
            'business-consulting' => 6,
            'asset-management-services' => 10,
            'engineering-and-design' => 12,
        ], $counts);
    }

    public function test_projects_keep_their_owning_entity(): void
    {
        $counts = Project::query()
            ->join('clients', 'clients.id', '=', 'projects.client_id')
            ->selectRaw('clients.slug as owner, count(*) as total')
            ->groupBy('clients.slug')
            ->pluck('total', 'owner')
            ->map(fn ($total) => (int) $total)
            ->all();

        $this->assertCount(12, $counts);
        $this->assertSame(6, $counts['ministry-of-environment-water-and-agriculture']);
        $this->assertSame(4, $counts['bin-jarallah-group-contracting']);
        $this->assertSame(4, $counts['tatweer-buildings-company']);
        $this->assertSame(0, Project::query()->whereNull('client_id')->count());
        $this->assertFalse(Client::query()->where('slug', 'bin-jarallah-group-contracting')->value('in_client_list'));
        $this->assertSame(30, Client::query()->where('in_client_list', true)->count());
    }

    public function test_every_seeded_record_is_published(): void
    {
        foreach ([HeroSlide::class, Statistic::class, ContentBlock::class, ServiceCategory::class, Service::class,
            Client::class, Region::class, Project::class, TeamMember::class, OrgPosition::class, Document::class, Partner::class] as $model) {
            $this->assertSame(0, $model::query()->where('status', '!=', PublicationStatus::Published->value)->count(), $model);
            $this->assertSame(0, $model::query()->whereNull('published_at')->count(), $model);
        }
    }

    public function test_every_translated_field_has_arabic_and_english(): void
    {
        $fields = [
            HeroSlide::class => ['headline', 'subline'],
            Statistic::class => ['label', 'unit'],
            ServiceCategory::class => ['title'],
            Service::class => ['title'],
            Region::class => ['name'],
            Project::class => ['title'],
            TeamMember::class => ['name', 'title', 'bio'],
            OrgPosition::class => ['title'],
            Document::class => ['title'],
            Partner::class => ['name', 'field'],
        ];

        foreach ($fields as $model => $attributes) {
            $model::query()->get()->each(function (Model $row) use ($attributes, $model): void {
                foreach ($attributes as $attribute) {
                    $value = $row->getAttribute($attribute);
                    if ($value === null) {
                        continue;
                    }
                    $this->assertNotEmpty($value['ar'] ?? null, "{$model}#{$row->getKey()}.{$attribute}.ar");
                    $this->assertNotEmpty($value['en'] ?? null, "{$model}#{$row->getKey()}.{$attribute}.en");
                }
            });
        }

        // Only the two unidentified client logos have no name (disputes).
        $this->assertSame(2, Client::query()->whereNull('name')->count());

        ContentBlock::query()->get()->each(function (ContentBlock $block): void {
            $payload = $block->payload;
            array_walk_recursive($payload, fn ($value, $key) => $this->assertNotSame('', $value, "{$block->section_key}.{$key}"));
            $this->assertTranslationMapsComplete($payload, $block->section_key);
        });
    }

    public function test_profile_errors_are_stored_as_printed(): void
    {
        $esg = ContentBlock::query()->where('section_key', 'esg')->firstOrFail()->payload;

        $this->assertSame('الحكومة', $esg['pillars'][1]['title']['ar']);
        $this->assertSame('المعايير البيئية', $esg['pillars'][2]['title']['ar']);
        $this->assertSame('لتحول الرقمي', Service::query()->where('slug', 'digital-transformation')->firstOrFail()->title['ar']);
    }

    public function test_disputes_record_errors_and_the_unreviewed_translation(): void
    {
        $translation = ContentDispute::query()->where('issue_code', 'EDITORIAL_TRANSLATION_UNREVIEWED')->get();

        $this->assertCount(1, $translation);
        $this->assertNull($translation->first()->subject_type);
        $this->assertSame(0, ContentDispute::query()->where('status', '!=', 'pending')->count());
        $this->assertSame(0, ContentDispute::query()->where('dispute_class', '!=', 'editorial')->count());

        // Every dispute that names a row points at an existing row.
        ContentDispute::query()->whereNotNull('subject_id')->get()
            ->each(fn (ContentDispute $dispute) => $this->assertNotNull($dispute->subject, "dispute #{$dispute->id}"));

        $this->assertTrue(ContentDispute::query()
            ->where('subject_type', (new Project)->getMorphClass())
            ->where('subject_id', Project::query()->where('slug', 'sports-facilities-efficiency-and-development')->value('id'))
            ->exists());
    }

    public function test_duplicated_bios_are_disputed_on_the_experts_who_lack_their_own(): void
    {
        $bioDisputes = ContentDispute::query()
            ->where('subject_type', (new TeamMember)->getMorphClass())
            ->where('field_path', 'bio')
            ->where('issue_code', 'EDITORIAL_DUPLICATE_TEXT')
            ->get()
            ->map(fn (ContentDispute $dispute): string => $dispute->subject->name['ar'])
            ->sort()
            ->values()
            ->all();

        $this->assertSame(['بسام جورية', 'محمد مسعد'], $bioDisputes);
        $this->assertSame(0, ContentDispute::query()->where('description', 'like', '%Financial%')->count());
    }

    public function test_seeder_skips_when_content_already_exists(): void
    {
        $this->seed(ProfileContentSeeder::class);

        $this->assertSame(26, Project::query()->count());
    }

    /**
     * @param  array<array-key, mixed>  $payload
     */
    private function assertTranslationMapsComplete(array $payload, string $path): void
    {
        if (array_key_exists('ar', $payload) && array_key_exists('en', $payload)) {
            $this->assertNotEmpty($payload['ar'], "{$path}.ar");
            $this->assertNotEmpty($payload['en'], "{$path}.en");

            return;
        }

        foreach ($payload as $key => $value) {
            if (is_array($value)) {
                $this->assertTranslationMapsComplete($value, "{$path}.{$key}");
            }
        }
    }
}

<?php

namespace Tests\Feature\Content;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Documents\Infrastructure\Models\Document;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Team\Infrastructure\Models\TeamMember;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicContentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
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
            'projects' => '/api/projects',
            'project' => '/api/projects/cop16-technical-audit',
            'clients' => '/api/clients',
            'regions' => '/api/regions',
            'experts' => '/api/experts',
            'org chart' => '/api/org-chart',
            'documents' => '/api/documents',
            'partners' => '/api/partners',
        ]);
    }

    #[DataProvider('publicEndpoints')]
    public function test_public_endpoint_defaults_to_english_and_varies_by_language(string $path): void
    {
        $this->getJson($path)
            ->assertOk()
            ->assertJsonPath('locale', 'en')
            ->assertHeader('Content-Language', 'en')
            ->assertHeader('Vary');

        $this->assertStringContainsString('Accept-Language', $this->getJson($path)->headers->get('Vary'));
    }

    #[DataProvider('publicEndpoints')]
    public function test_public_endpoint_serves_arabic(string $path): void
    {
        $this->getJson($path, ['Accept-Language' => 'ar-SA,ar;q=0.9'])
            ->assertOk()
            ->assertJsonPath('locale', 'ar')
            ->assertHeader('Content-Language', 'ar');
    }

    public function test_unsupported_language_falls_back_to_english(): void
    {
        $this->getJson('/api/partners', ['Accept-Language' => 'fr-FR'])
            ->assertOk()
            ->assertJsonPath('locale', 'en')
            ->assertJsonPath('data.0.field', 'Strategic support services');
    }

    public function test_settings_resolve_company_and_contact(): void
    {
        $this->getJson('/api/settings', ['Accept-Language' => 'ar'])
            ->assertOk()
            ->assertJsonPath('data.company_legal_name', 'شركة العمران المتقدم للاستشارات الهندسية')
            ->assertJsonPath('data.contact.email', 'info@omranconsult.com')
            ->assertJsonPath('data.contact.phones', ['+966543264982', '+966114999925'])
            ->assertJsonPath('data.contact.postal', 'رقم بريدي 241514 الرياض 11322');
    }

    public function test_home_returns_slides_statistics_and_resolved_blocks(): void
    {
        $response = $this->getJson('/api/home')->assertOk();

        $response
            ->assertJsonCount(14, 'data.hero_slides')
            ->assertJsonPath('data.hero_slides.1.key', 'hero')
            ->assertJsonPath('data.hero_slides.1.headline', 'Building asset efficiency')
            ->assertJsonPath('data.hero_slides.0.subline', null)
            ->assertJsonCount(5, 'data.statistics')
            ->assertJsonPath('data.statistics.0.value', 204)
            ->assertJsonPath('data.statistics.0.suffix', '+')
            ->assertJsonPath('data.statistics.1.value', 15)
            ->assertJsonPath('data.statistics.1.scale', 'billion')
            ->assertJsonPath('data.statistics.1.unit', 'SAR')
            ->assertJsonPath('data.statistics.2.value', 4500)
            ->assertJsonPath('data.statistics.3.value', 72.92)
            ->assertJsonPath('data.blocks.strategy.vision.title', 'Vision')
            ->assertJsonPath('data.blocks.esg.pillars.1.title', 'Government')
            ->assertJsonCount(7, 'data.blocks.education_goals.items')
            ->assertJsonCount(10, 'data.blocks.tools.items');

        $this->assertSame(
            ['about', 'education_goals', 'core_offerings', 'flexible_model', 'strategy', 'credentials',
                'work_stages', 'esg', 'tools', 'engineering_design', 'multi_phase_approach', 'section_titles'],
            array_keys($response->json('data.blocks')),
        );
    }

    public function test_home_omits_unpublished_blocks(): void
    {
        ContentBlock::query()->where('section_key', 'tools')->update(['status' => PublicationStatus::Draft->value]);

        $this->assertArrayNotHasKey('tools', $this->getJson('/api/home')->json('data.blocks'));
    }

    public function test_services_are_grouped_by_category(): void
    {
        $this->getJson('/api/services', ['Accept-Language' => 'ar'])
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.slug', 'engineering-consulting')
            ->assertJsonPath('data.0.title', 'الاستشارات الهندسية')
            ->assertJsonCount(9, 'data.0.services')
            ->assertJsonCount(12, 'data.4.services')
            ->assertJsonPath('data.2.services.0.title', 'لتحول الرقمي');
    }

    public function test_services_hide_draft_items(): void
    {
        Service::query()->where('slug', 'design-management')->update(['status' => PublicationStatus::Draft->value]);

        $this->getJson('/api/services')
            ->assertJsonCount(8, 'data.0.services')
            ->assertJsonPath('data.0.services.0.slug', 'building-inspection-and-site-supervision');
    }

    public function test_projects_are_paginated_with_owner_and_regions(): void
    {
        $this->getJson('/api/projects')
            ->assertOk()
            ->assertJsonCount(12, 'data')
            ->assertJsonPath('meta.total', 26)
            ->assertJsonPath('meta.per_page', 12)
            ->assertJsonPath('data.0.client.slug', 'ministry-of-environment-water-and-agriculture')
            ->assertJsonPath('data.0.regions', []);

        $this->getJson('/api/projects?per_page=100')->assertJsonCount(26, 'data');
        $this->getJson('/api/projects?page=3')->assertJsonCount(2, 'data');
    }

    public function test_projects_filter_by_client(): void
    {
        $this->getJson('/api/projects?client=bin-jarallah-group-contracting&per_page=50')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonPath('data.0.client.name', 'Bin Jarallah Group Contracting Company Ltd.');

        $this->getJson('/api/projects?client=unknown-client')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_projects_filter_by_region(): void
    {
        $this->getJson('/api/projects?region=jazan')->assertOk()->assertJsonCount(0, 'data');

        $project = Project::query()->where('slug', 'dam-projects-consulting-services')->firstOrFail();
        $project->regions()->attach(Region::query()->where('slug', 'jazan')->value('id'));

        $this->getJson('/api/projects?region=jazan', ['Accept-Language' => 'ar'])
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'dam-projects-consulting-services')
            ->assertJsonPath('data.0.regions.0.name', 'جازان')
            ->assertJsonPath('data.0.regions.0.code', 'SA-09');
    }

    public function test_project_index_validates_query(): void
    {
        $this->getJson('/api/projects?per_page=101')->assertUnprocessable()->assertJsonValidationErrors('per_page');
        $this->getJson('/api/projects?page=0')->assertUnprocessable()->assertJsonValidationErrors('page');
    }

    public function test_project_detail_by_slug(): void
    {
        $this->getJson('/api/projects/cop16-technical-audit', ['Accept-Language' => 'ar'])
            ->assertOk()
            ->assertJsonPath('data.slug', 'cop16-technical-audit')
            ->assertJsonPath('data.title', 'مشروع التدقيق الفني على تنفيذ مشروع مؤتمر الأطراف لمكافحة التصحر COP16.')
            ->assertJsonPath('data.client.name', 'وزارة البيئة والمياه والزراعة');

        $this->getJson('/api/projects/does-not-exist')->assertNotFound()->assertJsonPath('message', 'Not found.');
    }

    public function test_draft_and_deleted_projects_are_not_public(): void
    {
        Project::query()->where('slug', 'cop16-technical-audit')->update(['status' => PublicationStatus::Draft->value]);
        Project::query()->where('slug', 'central-veterinary-laboratory-dhurma')->firstOrFail()->delete();

        $this->getJson('/api/projects/cop16-technical-audit')->assertNotFound();
        $this->getJson('/api/projects/central-veterinary-laboratory-dhurma')->assertNotFound();
        $this->getJson('/api/projects?per_page=100')->assertJsonPath('meta.total', 24);
    }

    public function test_unpublished_owner_is_hidden_from_project(): void
    {
        Client::query()->where('slug', 'ministry-of-culture')->update(['status' => PublicationStatus::Draft->value]);

        $this->getJson('/api/projects/central-riyadh-heritage-buildings-restoration')
            ->assertOk()
            ->assertJsonPath('data.client', null);
        $this->getJson('/api/projects?client=ministry-of-culture')->assertJsonCount(0, 'data');
    }

    public function test_clients_list_owners_with_project_counts(): void
    {
        $response = $this->getJson('/api/clients')->assertOk()->assertJsonCount(31, 'data');

        $owner = collect($response->json('data'))->firstWhere('slug', 'bin-jarallah-group-contracting');
        $this->assertFalse($owner['in_client_list']);
        $this->assertSame(4, $owner['projects_count']);
        $this->assertSame(30, collect($response->json('data'))->where('in_client_list', true)->count());
        $this->assertNull($response->json('data.22.name'));
    }

    public function test_regions_list_codes(): void
    {
        $this->getJson('/api/regions', ['Accept-Language' => 'ar'])
            ->assertOk()
            ->assertJsonCount(11, 'data')
            ->assertJsonPath('data.0.code', null)
            ->assertJsonPath('data.0.name', 'المنطقة الشمالية')
            ->assertJsonPath('data.4.code', 'SA-01')
            ->assertJsonPath('data.4.projects_count', 0);
    }

    public function test_experts_list_only_experts(): void
    {
        $this->getJson('/api/experts')
            ->assertOk()
            ->assertJsonCount(6, 'data')
            ->assertJsonPath('data.0.name', 'Mohammed Mosaad')
            ->assertJsonPath('data.0.years_experience', 25);

        TeamMember::query()->where('is_expert', true)->orderBy('sort_order')->firstOrFail()->delete();
        $this->getJson('/api/experts')->assertJsonCount(5, 'data');
    }

    public function test_expert_title_matches_the_profile(): void
    {
        $this->getJson('/api/experts', ['Accept-Language' => 'ar'])
            ->assertJsonPath('data.1.name', 'بسام جورية')
            ->assertJsonPath('data.1.title', 'خبير واستشاري ، في الهندسة المدنية والمائية');

        $this->getJson('/api/experts', ['Accept-Language' => 'en'])
            ->assertJsonPath('data.1.title', 'Expert and Consultant in Civil and Water Engineering');
    }

    public function test_org_chart_links_people_and_ceo_reports(): void
    {
        $positions = collect($this->getJson('/api/org-chart')->assertOk()->assertJsonCount(29, 'data')->json('data'));

        $ceo = $positions->firstWhere('title', 'Chief Executive Officer');
        $this->assertSame('Eng. Mahmoud Ali Hussein', $ceo['person']['name']);
        $this->assertSame(6, $positions->where('parent_id', $ceo['id'])->count());
        $this->assertSame(3, $positions->where('person.name', 'Mr. Turki Faisal Saud Al-Ruwais Al-Otaibi')->count());
        $this->assertSame(['board', 'board_committees', 'executive_management', 'committees', 'projects', 'planning_control'],
            $positions->pluck('group')->unique()->values()->all());
    }

    public function test_documents_include_expired_certificates(): void
    {
        Carbon::setTestNow('2026-11-07');

        $documents = collect($this->getJson('/api/documents?kind=iso_certificate')->assertOk()->assertJsonCount(8, 'data')->json('data'));

        $this->assertSame(5, $documents->where('is_expired', true)->count());
        $this->assertSame('2026-06-02', $documents->firstWhere('standard_code', 'ISO 45001:2018')['valid_until']);
        $this->assertFalse($documents->firstWhere('standard_code', 'ISO 31000:2018')['is_expired']);

        $this->getJson('/api/documents?kind=license')->assertJsonCount(5, 'data')->assertJsonPath('data.0.valid_until', null);
        $this->getJson('/api/documents')->assertJsonCount(13, 'data');
        $this->getJson('/api/documents?kind=passport')->assertUnprocessable()->assertJsonValidationErrors('kind');

        Carbon::setTestNow();
    }

    public function test_documents_hide_drafts(): void
    {
        Document::query()->where('standard_code', 'ISO 9001:2015')->update(['status' => PublicationStatus::Draft->value]);

        $this->getJson('/api/documents?kind=iso_certificate')->assertJsonCount(7, 'data');
    }

    public function test_partners_resolve_field_per_locale(): void
    {
        $this->getJson('/api/partners', ['Accept-Language' => 'ar'])
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonPath('data.3.name', 'BUREAU VERITAS')
            ->assertJsonPath('data.3.field', 'في مجال الجودة والامتثال وإدارة المخاطر');
    }

    public function test_missing_translation_returns_null_without_fallback(): void
    {
        $client = Client::query()->where('slug', 'aramco')->firstOrFail();
        $client->update(['name' => ['ar' => 'أرامكو', 'en' => null]]);

        $clients = collect($this->getJson('/api/clients')->json('data'));
        $this->assertNull($clients->firstWhere('slug', 'aramco')['name']);
    }
}

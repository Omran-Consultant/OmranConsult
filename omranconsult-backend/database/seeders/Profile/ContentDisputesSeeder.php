<?php

namespace Database\Seeders\Profile;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\SiteSetting;
use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Modules\Documents\Domain\DocumentKind;
use App\Modules\Documents\Infrastructure\Models\Document;
use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use App\Modules\Team\Infrastructure\Models\OrgPosition;
use App\Modules\Team\Infrastructure\Models\TeamMember;
use Illuminate\Database\Eloquent\Model;

/**
 * Profile errors and open questions (docs/PROFILE_INVENTORY.md §6, docs/HANDOFF.md §4) and the
 * unreviewed-translation note (A25). All are editorial and pending; none hides content (A26).
 */
class ContentDisputesSeeder extends ProfileSeeder
{
    public function run(): void
    {
        $this->note(null, null, 'EDITORIAL_TRANSLATION_UNREVIEWED',
            'All English text was translated by Claude from the Arabic profile and has not been reviewed or approved by the company (A17, A25).',
            ['source' => 'Corporate Profile 2029 (Arabic only)']);

        $this->documents();
        $this->experts();
        $this->services();
        $this->contentBlocks();
        $this->orgChart();
        $this->projectsAndClients();
        $this->settingsAndStatistics();
    }

    private function documents(): void
    {
        foreach (['ISO 9001:2015' => 'ISO 45001', 'ISO 21500:2012' => 'ISO 14001', 'ISO 41001:2018' => 'ISO/IEC 27001'] as $standard => $printed) {
            $this->note($this->certificate($standard), 'standard_code', 'EDITORIAL_WRONG_LABEL',
                "The card label under this certificate reads {$printed}; standard_code follows the certificate scan. Confirm the label.",
                ['page' => 20, 'printed_label' => $printed]);
        }

        $this->note($this->certificate('ISO 26000:2010'), 'standard_code', 'EDITORIAL_WRONG_LABEL',
            'The profile label reads ISO 36000:2010; the certificate reads ISO 26000:2010. standard_code follows the certificate. Confirm 26000.',
            ['page' => 22, 'printed_label' => 'ISO 36000:2010']);

        Document::query()->where('kind', DocumentKind::IsoCertificate)->get()
            ->filter(fn (Document $document): bool => $document->isExpired())
            ->each(fn (Document $document) => $this->note($document, 'valid_until', 'EDITORIAL_EXPIRED_CERTIFICATE',
                "Printed validity ended on {$document->valid_until->toDateString()}. The document stays public (A26); a renewed copy is needed (U24).",
                ['pages' => '19–22', 'valid_from' => $document->valid_from?->toDateString(), 'valid_until' => $document->valid_until->toDateString()]));
    }

    private function experts(): void
    {
        $this->note($this->expert('محمد مسعد'), 'bio', 'EDITORIAL_DUPLICATE_TEXT',
            'The bio printed under this expert (Studies and Design Consultant) describes عبدالرحمن المقبل (Data Analysis Consultant): «متخصص في الاستشارات التقنية وتحليل البيانات», «تصميم لوحات المعلومات». The same text is printed under Al-Muqbil. The company must supply Mohammed Mosaad\'s bio.',
            ['pages' => '25–26', 'printed_bio_describes' => 'عبدالرحمن المقبل']);
        $this->note($this->expert('بسام جورية'), 'bio', 'EDITORIAL_DUPLICATE_TEXT',
            'The bio printed under this expert (Civil and Water Engineering) describes وسيم اصفهان (Engineering Management and Quality): «متخصص في البنية التحتية والإدارة الهندسية وتطبيق معايير الجودة», «ماجستير الإدارة الهندسية», «Bureau Veritas». The same text is printed under Waseem. The company must supply Bassam Jouriyeh\'s bio.',
            ['pages' => '25–26', 'printed_bio_describes' => 'وسيم اصفهان']);
        $this->note($this->expert('د/ أميرة البرتقالي'), 'bio', 'EDITORIAL_INCOMPLETE_TEXT',
            'Bio ends mid-sentence with «،». The company must supply the full bio.',
            ['page' => 26]);
    }

    private function services(): void
    {
        $this->note($this->service('work-order-task-and-contractor-management-03'), 'title', 'EDITORIAL_DUPLICATE_TEXT',
            'Asset-management service 03 repeats item 02. The company must supply item 03.',
            ['page' => 34, 'printed' => 'إدارة أوامر العمل والمهام والمقاولين']);
        $this->note($this->service('data-and-asset-management-and-business-continuity'), 'title', 'EDITORIAL_DUPLICATE_TEXT',
            'Item 08 repeats «ضمان استمرارية الأعمال» from item 07. Confirm item 08.',
            ['page' => 34, 'printed' => 'إدارة البيانات والأصول وضمان استمرارية الأعمال']);
        $this->note($this->service('reporting-dashboards-and-decision-support'), 'title.ar', 'EDITORIAL_SPELLING',
            'Missing space in «ولوحاتالمؤشرات».',
            ['page' => 34, 'printed' => 'التقارير ولوحاتالمؤشرات ودعم اتخاذ القرار']);
        $this->note($this->service('digital-transformation'), 'title.ar', 'EDITORIAL_SPELLING',
            'Printed «لتحول الرقمي»; likely «التحول الرقمي».',
            ['page' => 30, 'printed' => 'لتحول الرقمي']);
        $this->note(ServiceCategory::query()->where('slug', 'asset-management-services')->firstOrFail(), 'title', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'The profile heading for this list reads «خدماتنا»; the category title «خدمات إدارة الأصول» was written for the website. Confirm the title.',
            ['page' => 34, 'printed_heading' => 'خدماتنا']);
    }

    private function contentBlocks(): void
    {
        $esg = $this->block('esg');
        $this->note($esg, 'payload.pillars.2.title', 'EDITORIAL_DUPLICATE_TEXT',
            'The third pillar repeats «المعايير البيئية»; it is likely «المعايير الاجتماعية» (social).',
            ['page' => 28, 'printed' => 'المعايير البيئية']);
        $this->note($esg, 'payload.pillars.1.title', 'EDITORIAL_SPELLING',
            'Printed «الحكومة» (government); likely «الحوكمة» (governance). The English follows the print.',
            ['page' => 28, 'printed' => 'الحكومة']);

        $this->note($this->block('engineering_design'), 'payload.body', 'EDITORIAL_SPELLING',
            'Printed «(D3)»; likely «3D».',
            ['page' => 36, 'printed' => '(D3)']);
        $this->note($this->block('tools'), 'payload.items', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'Tools describe one project\'s resources (printer model, sedans, four 4×4 vehicles). Confirm whether to publish these details.',
            ['pages' => '31–32']);
        $this->note($this->block('strategy'), 'payload.vision.body', 'EDITORIAL_SPELLING',
            'Printed «دارسة»; likely «دراسة».',
            ['page' => 16, 'printed' => 'دارسة']);
        $this->note($this->block('core_offerings'), 'payload.items.3.title', 'EDITORIAL_SPELLING',
            'Printed «القوي العاملة والافراد»; likely «القوى العاملة والأفراد».',
            ['page' => 10, 'printed' => 'إدارة القوي العاملة والافراد']);
        $this->note($this->block('multi_phase_approach'), 'payload', 'EDITORIAL_SPELLING',
            'Spelling as printed: «مستوي»، «الإلتزام»، «لإستلام»، «اجراء».',
            ['page' => 38, 'printed' => ['مستوي', 'الإلتزام', 'لإستلام', 'اجراء']]);
        $this->note(HeroSlide::query()->where('key', 'hero')->firstOrFail(), 'subline.ar', 'EDITORIAL_SPELLING',
            'Printed «تعليمة»; likely «تعليمية».',
            ['pages' => '3, 5', 'printed' => 'لبيئة تعليمة مستدامة']);
    }

    private function orgChart(): void
    {
        $duplicateHr = OrgPosition::query()
            ->where('group', 'committees')
            ->get()
            ->first(fn (OrgPosition $position): bool => $position->title['ar'] === 'مدير الموارد البشرية');
        $this->note($duplicateHr, 'title', 'EDITORIAL_DUPLICATE_TEXT',
            '«مدير الموارد البشرية» appears in both the CEO column and the committees column. Confirm.',
            ['page' => 40]);

        $this->note(OrgPosition::class, null, 'EDITORIAL_MIGRATION_AMBIGUITY',
            'Several people hold more than one box: Al-Shahrani (board + nominations), Al-Zahrani (board + audit), Al-Anazi (projects + committee), Anouz (procurement + committee), Al-Otaibi (HR + committee + HR), Shalaby (tenders + HSE), Ghoneim (cost control + supervision). Confirm intended.',
            ['page' => 40]);
        $this->note(OrgPosition::class, 'parent_id', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'Reporting lines below board level are unclear; only the six managers drawn from the CEO box are linked to the CEO. Confirm the structure for the committees, projects, and planning columns.',
            ['page' => 40]);
        $this->note($this->orgPosition('مدير مشاريع الأشراف'), 'title.ar', 'EDITORIAL_SPELLING',
            'Printed «الأشراف»; likely «الإشراف».',
            ['page' => 40, 'printed' => 'مدير مشاريع الأشراف']);
    }

    private function projectsAndClients(): void
    {
        $this->note(Project::query()->where('slug', 'sports-facilities-efficiency-and-development')->firstOrFail(), 'title', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'Printed as two bullets on p.12; stored as one project. Confirm.',
            ['page' => 12, 'printed' => ['تقديم الخدمات الاستشارية والفنية لرفع', 'كفاءة وتطوير المنشآت الرياضية.']]);
        $this->note($this->client('bin-jarallah-group-contracting'), 'in_client_list', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'Bin Jarallah Group owns four projects but is not among the 30 clients on p.44. Stored as an owner outside the client list. Confirm.',
            ['pages' => '12, 44']);
        $this->note($this->client('ministry-of-justice'), 'name', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'Client logo #21 (emblem with scales) has no printed name; identified as the Ministry of Justice from the same emblem on p.12. Confirm.',
            ['pages' => '12, 44', 'logo_position' => 21]);
        foreach ([23 => 'calligraphic mark, no readable name', 30 => 'red emblem with palm and crossed swords, no readable name'] as $position => $description) {
            $this->note(Client::query()->where('sort_order', $position)->firstOrFail(), 'name', 'EDITORIAL_MIGRATION_AMBIGUITY',
                "Client logo #{$position} ({$description}). Identify the client.",
                ['page' => 44, 'logo_position' => $position]);
        }
        $this->note(Project::class, 'regions', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'The profile map links no project to a region; project_region is empty. Some titles name regions (dams in Jazan, Asir, Najran, Al-Baha, Makkah; Central, Northern, Southern, Western, Eastern regions). Supply the project–region links.',
            ['pages' => '12, 14']);
        $this->note(Region::query()->where('slug', 'northern-region')->firstOrFail(), 'code', 'EDITORIAL_MIGRATION_AMBIGUITY',
            '«المنطقة الشمالية» is not an administrative region (it may mean Northern Borders, Al-Jawf, or Hail). Code left empty. Confirm.',
            ['page' => 14]);
    }

    private function settingsAndStatistics(): void
    {
        $this->note(HeroSlide::query()->where('key', 'projects_map')->firstOrFail(), 'subline', 'EDITORIAL_CONFLICTING_STATS',
            '«+28 مشروع على مستوى المملكة» (p.13) versus «+204 مشروع تم إنجازة» (p.7, p.14). Explain both figures.',
            ['pages' => '7, 13, 14', 'printed' => ['+28', '+204']]);
        $this->note(Statistic::query()->where('key', 'completed_projects')->firstOrFail(), 'label', 'EDITORIAL_SPELLING',
            'Divider text prints «إنجازة»; likely «إنجازه». Spelling in the label «اشرافي» is as printed.',
            ['pages' => '7, 14', 'printed' => '+204 مشروع تم إنجازة']);
        $this->note(Statistic::query()->where('key', 'project_volume')->firstOrFail(), 'unit', 'EDITORIAL_MIGRATION_AMBIGUITY',
            'The unit SAR is implied by the riyal icon, not printed as text. Confirm.',
            ['page' => 8]);

        $contact = SiteSetting::query()->where('key', 'contact')->firstOrFail();
        $this->note($contact, 'value.postal', 'EDITORIAL_CONFLICTING_PHONE',
            'Certificates print P.O. Box 24151; the contact page prints postal number 241514. Confirm.',
            ['pages' => '19–22, 45', 'printed' => ['24151', '241514']]);
        $this->note(SiteSetting::query()->where('key', 'company_legal_name')->firstOrFail(), 'value.en', 'EDITORIAL_BRAND_NAME',
            'Certificate holder name varies: ADVANCED ALOMRAN CENTER (AAC), ALOMRAN ADVANCED CENTER, ALOMRAN ADVANCED COMPANY. The English name OMRAN Advanced Company follows the logo lockup. Confirm the legal English name (U17).',
            ['pages' => '1, 19–22']);
    }

    /**
     * @param  Model|class-string<Model>|null  $subject  a row, a whole collection (class name), or the whole site (null)
     * @param  array<string, mixed>  $snapshot
     */
    private function note(Model|string|null $subject, ?string $fieldPath, string $issueCode, string $description, array $snapshot): void
    {
        ContentDispute::create([
            'dispute_class' => 'editorial',
            'subject_type' => $subject instanceof Model ? $subject->getMorphClass() : $subject,
            'subject_id' => $subject instanceof Model ? $subject->getKey() : null,
            'field_path' => $fieldPath,
            'issue_code' => $issueCode,
            'description' => $description,
            'reference_snapshot' => $snapshot,
            'status' => 'pending',
        ]);
    }

    private function certificate(string $standard): Document
    {
        return Document::query()->where('standard_code', $standard)->firstOrFail();
    }

    private function expert(string $nameAr): TeamMember
    {
        return TeamMember::query()->where('is_expert', true)->get()
            ->firstOrFail(fn (TeamMember $member): bool => $member->name['ar'] === $nameAr);
    }

    private function service(string $slug): Service
    {
        return Service::query()->where('slug', $slug)->firstOrFail();
    }

    private function block(string $sectionKey): ContentBlock
    {
        return ContentBlock::query()->where('page', 'home')->where('section_key', $sectionKey)->firstOrFail();
    }

    private function orgPosition(string $titleAr): OrgPosition
    {
        return OrgPosition::query()->get()
            ->firstOrFail(fn (OrgPosition $position): bool => $position->title['ar'] === $titleAr);
    }

    private function client(string $slug): Client
    {
        return Client::query()->where('slug', $slug)->firstOrFail();
    }
}

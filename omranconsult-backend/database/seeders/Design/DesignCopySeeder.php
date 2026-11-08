<?php

namespace Database\Seeders\Design;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\Statistic;
use App\Modules\Documents\Infrastructure\Models\Document;
use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use Database\Seeders\Profile\ProfileSeeder;
use Illuminate\Database\Eloquent\Model;

/**
 * Marketing copy the Figma design adds or rewrites (PHASE4C D4, SDD §6.7 P22, A29).
 *
 * Arabic is the exact design text (figma-structure.txt and, for component instances, the desktop
 * renders); English is Claude's translation, published under the A25 exception. One accent word is
 * marked `{accent}…{/accent}` and line breaks are "\n". Every block gets a `design_copy_review`
 * dispute so the company can review it. Facts stay with the API records (D4a, D6).
 */
class DesignCopySeeder extends ProfileSeeder
{
    private const ISSUE = 'design_copy_review';

    private const SOURCE = 'Figma design (docs/design-reference, 2026-11-07)';

    public function run(): void
    {
        $order = 100;
        foreach ($this->pages() as $page => $payload) {
            $block = ContentBlock::create([
                'page' => $page,
                'section_key' => 'design_copy',
                'payload' => $payload,
                'sort_order' => $order++,
                ...self::published(),
            ]);

            self::dispute($block, 'payload', self::ISSUE,
                "Marketing copy for the «{$page}» page taken from the Figma design (D4). Review the Arabic and the English translation before launch.",
                ['source' => self::SOURCE]);
        }

        $highlights = ContentBlock::create([
            'page' => 'home',
            'section_key' => 'service_highlights',
            'payload' => ['items' => $this->serviceHighlights()],
            'sort_order' => $order,
            ...self::published(),
        ]);
        self::dispute($highlights, 'payload.items', self::ISSUE,
            'The six home service cards (titles, descriptions, links) are copy from the Figma design. They summarise the services; the full lists come from /api/services. Card 01 mentions ISO 55001 as a standard followed, not as a certificate held.',
            ['source' => self::SOURCE]);

        $this->facts();
        $this->linkCoverageFigure();
        $this->annotateExistingDisputes();
        $this->recordDesignDifferences();
    }

    /**
     * Statistics stated in the profile text and shown as figures by the design (hero, about).
     */
    private function facts(): void
    {
        $rows = [
            ['years_experience', 21, 'عاماً من الخبرة', 'Years of experience', 'Profile p.5: «لأكثر من 21 عاما».'],
            ['group_experience', 50, 'عاماً من خبرات مجموعة بن جارالله', 'Years of Bin Jarallah Group experience', 'Profile p.5: «الممتدة لأكثر من 50 عاماً».'],
        ];

        $order = (int) Statistic::query()->max('sort_order');
        foreach ($rows as [$key, $value, $labelAr, $labelEn, $source]) {
            $statistic = Statistic::create([
                'key' => $key,
                'value' => $value,
                'suffix' => '+',
                'label' => self::t($labelAr, $labelEn),
                'sort_order' => ++$order,
                ...self::published(),
            ]);

            self::dispute($statistic, 'label', self::ISSUE,
                "The value is a fact from the profile text ({$source}); the label is design copy. Review the label.",
                ['source' => self::SOURCE]);
        }
    }

    /**
     * Q15: the coverage subtitle repeats the disputed «28» figure; link it to the existing dispute.
     */
    private function linkCoverageFigure(): void
    {
        $block = ContentBlock::query()->where('page', 'home')->where('section_key', 'design_copy')->firstOrFail();

        self::dispute($block, 'payload.coverage.subtitle', 'EDITORIAL_CONFLICTING_STATS',
            'The design coverage text says «أكثر من 28 مشروعاً» while the statistics say 204+. Seeded as designed; resolve together with the hero slide dispute on +28 versus +204 (U23).',
            ['source' => self::SOURCE, 'related_issue' => 'EDITORIAL_CONFLICTING_STATS', 'related_subject' => 'hero_slides.projects_map']);
    }

    /**
     * Q13: the design "corrects" some printed profile errors. The site keeps the printed text;
     * each existing dispute records what the design suggests.
     */
    private function annotateExistingDisputes(): void
    {
        $esg = ContentBlock::query()->where('page', 'home')->where('section_key', 'esg')->firstOrFail();
        $strategy = ContentBlock::query()->where('page', 'home')->where('section_key', 'strategy')->firstOrFail();

        $suggestions = [
            [$esg, 'payload.pillars.1.title', 'الحوكمة'],
            [$esg, 'payload.pillars.2.title', 'المعايير الاجتماعية'],
            [$strategy, 'payload.vision.body', 'دراسة'],
            [$this->service('work-order-task-and-contractor-management-03'), 'title', 'إدارة البيانات وأنظمة معلومات الأصول'],
            [$this->service('data-and-asset-management-and-business-continuity'), 'title', 'إدارة الصيانة الوقائية والتصحيحية'],
            [$this->service('reporting-dashboards-and-decision-support'), 'title.ar', 'التقارير ولوحات المؤشرات ودعم اتخاذ القرار'],
            [$this->service('digital-transformation'), 'title.ar', 'التحول الرقمي'],
            [HeroSlide::query()->where('key', 'hero')->firstOrFail(), 'subline.ar', 'لبيئة تعليمية مستدامة'],
            [HeroSlide::query()->where('key', 'projects_map')->firstOrFail(), 'subline', 'أكثر من 28 مشروعاً (Coverage) and 204+ (Stats)'],
        ];

        foreach ($suggestions as [$subject, $fieldPath, $suggestion]) {
            $dispute = $this->existingDispute($subject, $fieldPath);
            $dispute->update([
                'description' => $dispute->description." Design suggests «{$suggestion}»; the site shows the printed text (PHASE4C Q13).",
                'reference_snapshot' => [...($dispute->reference_snapshot ?? []), 'design_suggests' => $suggestion],
            ]);
        }
    }

    /**
     * Design data that differs from the profile and has no dispute yet (D6, Q13).
     */
    private function recordDesignDifferences(): void
    {
        $strategy = ContentBlock::query()->where('page', 'home')->where('section_key', 'strategy')->firstOrFail();

        self::dispute($strategy, 'payload.objectives.body', 'EDITORIAL_DESIGN_DIFFERS',
            'Design suggests a longer objectives text: «التطوير المستمر والتوسع بشكل أكبر مع الحفاظ على الأداء المتميز لأعمالنا، وتوفير الكفاءات والخبرات الهندسية والإدارية لإدارة تنفيذ المشاريع.» (the added part is printed at the end of the mission). The site shows the printed text.',
            ['source' => self::SOURCE, 'design_suggests' => 'التطوير المستمر والتوسع بشكل أكبر مع الحفاظ على الأداء المتميز لأعمالنا، وتوفير الكفاءات والخبرات الهندسية والإدارية لإدارة تنفيذ المشاريع.']);
        self::dispute(Document::class, null, 'EDITORIAL_DESIGN_DIFFERS',
            'The design shows six ISO cards including ISO 55001, which the profile does not list; the profile has ISO 21500, 31000 and 26000. The site shows the eight certificates from the profile (D6).',
            ['source' => self::SOURCE, 'design_shows' => ['ISO 55001', 'ISO 41001', 'ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 27001']]);
        self::dispute(ServiceCategory::class, null, 'EDITORIAL_DESIGN_DIFFERS',
            'The design lists six items per service axis and merges some (for example «إدارة المشاريع والعقود»); the profile lists 9, 9 and 6. The site shows every printed item (D4).',
            ['source' => self::SOURCE]);
    }

    private function existingDispute(Model $subject, string $fieldPath): ContentDispute
    {
        return ContentDispute::query()
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->where('field_path', $fieldPath)
            ->firstOrFail();
    }

    private function service(string $slug): Service
    {
        return Service::query()->where('slug', $slug)->firstOrFail();
    }

    /**
     * Latin overlines are the same in both locales.
     *
     * @return array{ar: string, en: string}
     */
    private static function latin(string $text): array
    {
        return self::t($text, $text);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function pages(): array
    {
        return [
            'home' => $this->home(),
            'about' => $this->about(),
            'services' => $this->services(),
            'projects' => $this->projects(),
            'contact' => $this->contact(),
            'media' => $this->media(),
            'layout' => $this->layout(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function home(): array
    {
        return [
            'hero' => [
                'overline' => self::latin('OMRAN ADVANCED COMPANY'),
                // Shorter variants from the 390 frame (Home — Mobile 390).
                'overline_short' => self::latin('OMRAN ADVANCED'),
                'lead_short' => self::t(
                    'شركة استشارات هندسية مصنفة من الدرجة الأولى في إدارة الأصول والمرافق والتطوير والأتمتة لأكثر من 21 عاماً.',
                    'A first-grade engineering consultancy in asset and facility management, development and automation for more than 21 years.',
                ),
                'headline' => self::t("نبني {accent}كفاءة{/accent} الأصول\nلمستقبل مستدام", "Building asset {accent}efficiency{/accent}\nfor a sustainable future"),
                'lead' => self::t(
                    'شركة استشارات هندسية مصنفة من الدرجة الأولى، ندعم التكامل في إدارة الأصول والمرافق وأعمال التطوير والأتمتة في المملكة لأكثر من 21 عاماً.',
                    'A first-grade engineering consultancy supporting integrated asset and facility management, development and automation in the Kingdom for more than 21 years.',
                ),
                'cta_primary' => self::t('استكشف مشاريعنا', 'Explore our projects'),
                'cta_secondary' => self::t('تعرّف علينا', 'About us'),
                'stat_labels' => [
                    'project_volume' => self::t('حجم المشاريع (ر.س)', 'Project volume (SAR)'),
                    'completed_projects' => self::t('مشروع منجز', 'Projects delivered'),
                    'years_experience' => self::t('عاماً من الخبرة', 'Years of experience'),
                ],
            ],
            'stats' => [
                'overline' => self::latin('OMRAN IN NUMBERS'),
                'title' => self::t('أرقام تعكس حجم الثقة', 'Figures that reflect our clients’ trust'),
                'side_text' => self::t(
                    'مدعومون بخبرات مجموعة بن جارالله القابضة الممتدة لأكثر من 50 عاماً في الإنشاءات والتطوير العقاري وإدارة المرافق.',
                    'Backed by more than 50 years of Bin Jarallah Holding Group experience in construction, real estate development and facility management.',
                ),
                // Short labels for the 2-column mobile grid (Home — Mobile 390).
                'short_labels' => [
                    'completed_projects' => self::t('مشروع منجز', 'Projects delivered'),
                    'project_volume' => self::t('حجم المشاريع', 'Project volume'),
                    'employees' => self::t('موظف خبير', 'Expert staff'),
                    'local_content' => self::t('محتوى محلي', 'Local content'),
                    'partnerships' => self::t('شراكات نوعية', 'Partnerships'),
                ],
            ],
            'about' => [
                'overline' => self::latin('01 — ABOUT US'),
                'title' => self::t('شريك هندسي موثوق لإدارة الأصول والمرافق', 'A trusted engineering partner for asset and facility management'),
                'intro' => self::t(
                    'نمتلك الخبرة العملية في إدارة الأصول والمرافق من خلال الإشراف على مشاريع إدارة المرافق المتكاملة IFM، وإنشاء منصة OSOOL 360، ودعم رفع النضج المؤسسي لدى الجهات الحكومية.',
                    'We bring hands-on asset and facility management experience from supervising integrated facility management (IFM) projects, building the OSOOL 360 platform, and helping government entities raise their institutional maturity.',
                ),
                'badge_label' => self::t('عاماً من خبرات مجموعة بن جارالله', 'Years of Bin Jarallah Group experience'),
                'features' => [
                    ['title' => self::t('مصنفة من الدرجة الأولى', 'First-grade classification'), 'text' => self::t('شركة استشارات هندسية معتمدة بخبرة تتجاوز 21 عاماً', 'An accredited engineering consultancy with more than 21 years of experience')],
                    ['title' => self::t('وفق أفضل الممارسات', 'Following best practice'), 'text' => self::t('الدليل الوطني لإدارة الأصول ومعايير ISO 55001 و ISO 41001', 'The National Asset Management Manual and the ISO 55001 and ISO 41001 standards')],
                    ['title' => self::t('حلول رقمية متقدمة', 'Advanced digital solutions'), 'text' => self::t('أنظمة CAFM ونظم المعلومات الجغرافية GIS ولوحات المؤشرات التنفيذية', 'CAFM systems, geographic information systems (GIS) and executive dashboards')],
                ],
                'link' => self::t('اقرأ المزيد عن عمران', 'Read more about OMRAN'),
                'intro_short' => self::t(
                    'نمتلك الخبرة العملية في إدارة الأصول والمرافق عبر الإشراف على مشاريع IFM وإنشاء منصة OSOOL 360.',
                    'We bring hands-on asset and facility management experience from supervising IFM projects and building the OSOOL 360 platform.',
                ),
                'link_short' => self::t('اقرأ المزيد', 'Read more'),
            ],
            'services' => [
                'overline' => self::latin('02 — SERVICES'),
                'title' => self::t('حلول متكاملة بخبرات هندسية', 'Integrated solutions with engineering expertise'),
                'subtitle' => self::t(
                    'نموذج عمل مرن يغطي دورة حياة الأصل كاملة، من التخطيط والتصميم إلى التشغيل والتحسين المستمر.',
                    'A flexible operating model that covers the whole asset lifecycle, from planning and design to operation and continuous improvement.',
                ),
            ],
            'projects' => [
                'overline' => self::latin('03 — FEATURED PROJECTS'),
                'overline_short' => self::latin('03 — PROJECTS'),
                'title' => self::t('مشاريع تصنع الأثر', 'Projects that make an impact'),
                'subtitle' => self::t(
                    'أكثر من 204 مشروع استشاري وإشرافي في مختلف مناطق المملكة، مع جهات حكومية وخاصة رائدة.',
                    'More than 204 consulting and supervision projects across the Kingdom, with leading government and private entities.',
                ),
            ],
            'coverage' => [
                'overline' => self::latin('04 — NATIONWIDE PRESENCE'),
                'title' => self::t('حضور يغطي مناطق المملكة', 'A presence across the Kingdom'),
                'subtitle' => self::t(
                    'نخدم عملاءنا في أكثر من 28 مشروعاً على مستوى المملكة، من الرياض إلى جازان والمنطقة الشرقية.',
                    'We serve our clients in more than 28 projects across the Kingdom, from Riyadh to Jazan and the Eastern Province.',
                ),
            ],
            'trust' => [
                'overline' => self::latin('05 — CERTIFIED EXCELLENCE'),
                'title' => self::t('تميّز معتمد وشراكات نوعية', 'Certified excellence and distinguished partnerships'),
                'subtitle' => self::t(
                    'معايير نلتزم بها وثقة نعززها، عبر شهادات الأيزو العالمية وشراكات مع بيوت خبرة دولية.',
                    'Standards we uphold and trust we strengthen, through international ISO certificates and partnerships with international firms.',
                ),
                'partners_label' => self::t('شركاؤنا', 'Our partners'),
            ],
            'cta' => [
                'title' => self::t('لنصنع الأثر معاً', 'Let’s make an impact together'),
                'text' => self::t(
                    'حدّثنا عن مشروعك، وسيتواصل معك فريق خبرائنا لتصميم الحل الأنسب لأصولك ومرافقك.',
                    'Tell us about your project, and our experts will contact you to design the right solution for your assets and facilities.',
                ),
                'text_short' => self::t('حدّثنا عن مشروعك وسيتواصل معك فريق خبرائنا.', 'Tell us about your project and our experts will contact you.'),
                'primary' => self::t('اطلب استشارة', 'Request a consultation'),
                'secondary' => self::t('حمّل الملف التعريفي', 'Download the company profile'),
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function serviceHighlights(): array
    {
        $cards = [
            ['01', 'building', 'إدارة الأصول والمرافق', 'Asset and facility management',
                'حصر وتوثيق الأصول وتقييمها، وتخطيط استراتيجيات الإحلال والتجديد وفق الدليل الوطني و ISO 55001.',
                'Inventory, documentation and assessment of assets, and replacement and renewal planning in line with the national manual and ISO 55001.',
                '/services#asset-management'],
            ['02', 'building', 'الاستشارات الهندسية', 'Engineering consulting',
                'دراسات فنية متخصصة ورفع كفاءة عمليات التشغيل والصيانة للجهات الحكومية والخاصة.',
                'Specialised technical studies and more efficient operation and maintenance for government and private entities.',
                '/services#pillars'],
            ['03', 'building', 'الإشراف وإدارة المشاريع', 'Supervision and project management',
                'إدارة المشاريع والدعم الفني والإشراف على عقود التشغيل والصيانة والنظافة.',
                'Project management, technical support, and supervision of operation, maintenance and cleaning contracts.',
                '/services#pillars'],
            ['04', 'building', 'الهندسة والتصميم', 'Engineering and design',
                'التصميم المعماري والإنشائي والكهروميكانيكي، والدراسات والتصاميم البيئية والمستدامة.',
                'Architectural, structural and electromechanical design, and environmental and sustainable studies and designs.',
                '/services#engineering'],
            ['05', 'building', 'التحول الرقمي', 'Digital transformation',
                'أنظمة CAFM ونظم المعلومات الجغرافية GIS ولوحات المؤشرات التنفيذية لدعم القرار.',
                'CAFM systems, geographic information systems (GIS) and executive dashboards that support decisions.',
                '/services#pillars'],
            ['06', 'building', 'برامج التمكين', 'Enablement programmes',
                'تأهيل الكوادر الفنية والإدارية العاملة على إدارة الأصول والمرافق عبر برامج مستدامة.',
                'Sustainable programmes that qualify the technical and administrative staff who manage assets and facilities.',
                '/services#offerings'],
        ];

        return array_map(fn (array $card): array => [
            'number' => $card[0],
            'icon' => $card[1],
            'title' => self::t($card[2], $card[3]),
            'description' => self::t($card[4], $card[5]),
            'href' => $card[6],
        ], $cards);
    }

    /**
     * @return array<string, mixed>
     */
    private function about(): array
    {
        return [
            'hero' => [
                'title' => self::t("رؤية طموحة\nنحو {accent}عمران{/accent} مستدام", "An ambitious vision\ntoward sustainable {accent}development{/accent}"),
                'intro' => self::t(
                    'شركة العمران المتقدم للاستشارات الهندسية، شركة استشارية مصنفة من الدرجة الأولى، مدعومة بخبرات مجموعة بن جارالله القابضة الممتدة لأكثر من 50 عاماً.',
                    'OMRAN Advanced Company for Engineering Consultancy is a first-grade classified consultancy backed by more than 50 years of Bin Jarallah Holding Group experience.',
                ),
                // Shorter variant from the 390 frame (About — Mobile 390).
                'intro_short' => self::t(
                    'شركة استشارية مصنفة من الدرجة الأولى بخبرة تتجاوز 21 عاماً.',
                    'A first-grade classified consultancy with more than 21 years of experience.',
                ),
            ],
            'intro' => [
                'overline' => self::latin('WHO WE ARE'),
                'stat_labels' => [
                    'years_experience' => self::t('عاماً من الخبرة', 'Years of experience'),
                    'group_experience' => self::t('عاماً من خبرات المجموعة', 'Years of group experience'),
                ],
            ],
            'education_goals' => ['overline' => self::latin('OUR WORK')],
            'strategy' => [
                'overline' => self::latin('STRATEGY'),
                'title' => self::t('استراتيجية شركة العمران', 'OMRAN strategy'),
            ],
            'esg' => ['overline' => self::latin('GOVERNANCE & ESG')],
            'work_stages' => ['overline' => self::latin('WORK STAGES')],
            'experts' => [
                'overline' => self::latin('OUR EXPERTS'),
                'subtitle' => self::t(
                    'نخبة من الخبراء والمستشارين بخبرات تمتد من 15 إلى أكثر من 35 عاماً في الهندسة والتصميم والبيانات.',
                    'Experts and consultants with 15 to more than 35 years of experience in engineering, design and data.',
                ),
            ],
            'org_chart' => ['overline' => self::latin('ORGANIZATION')],
            'licenses' => ['overline' => self::latin('LICENSES')],
            'partners' => ['overline' => self::latin('PARTNERS')],
            'clients' => ['overline' => self::latin('CLIENTS')],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function services(): array
    {
        return [
            'hero' => [
                'title' => self::t("حلول متكاملة\nبخبرات هندسية", "Integrated solutions\nwith engineering expertise"),
                'intro' => self::t(
                    'نموذج عمل مرن يغطي دورة حياة الأصل كاملة: من الدراسات والتصميم، إلى الإشراف وإدارة المشاريع، وصولاً إلى التشغيل والتحسين المستمر.',
                    'A flexible operating model covering the whole asset lifecycle: from studies and design, through supervision and project management, to operation and continuous improvement.',
                ),
                // Shorter variants from the 390 frame (Services — Mobile 390).
                'intro_short' => self::t('نموذج عمل مرن يغطي دورة حياة الأصل كاملة.', 'A flexible operating model covering the whole asset lifecycle.'),
            ],
            'pillars' => [
                'overline' => self::latin('01 — WHAT WE DO'),
                'overline_short' => self::latin('WHAT WE DO'),
                'title' => self::t('ثلاثة محاور لخدمة مشاريعك', 'Three pillars that serve your projects'),
                'subtitle' => self::t(
                    'منظومة خدمات تكاملية تجمع الخبرة الهندسية والإدارية والرقمية تحت سقف واحد.',
                    'An integrated set of services that brings engineering, management and digital expertise under one roof.',
                ),
            ],
            'asset_management' => [
                'overline' => self::latin('02 — ASSET & FACILITY MANAGEMENT'),
                'overline_short' => self::latin('ASSET MANAGEMENT'),
                'title' => self::t('أصول مستدامة: إدارة ذكية وكفاءة متجددة', 'Sustainable assets: smart management, renewed efficiency'),
                'subtitle' => self::t(
                    'عشر خدمات متخصصة تغطي دورة حياة الأصل وفق الدليل الوطني لإدارة الأصول والمرافق.',
                    'Ten specialised services covering the asset lifecycle in line with the National Asset and Facility Management Manual.',
                ),
            ],
            'engineering' => [
                'overline' => self::latin('03 — ENGINEERING & DESIGN'),
                'title' => self::t('هندسة تُلهم وتصاميم تصنع المستقبل', 'Engineering that inspires, designs that shape the future'),
            ],
            'approach' => [
                'overline' => self::latin('04 — OUR APPROACH'),
                'overline_short' => self::latin('OUR APPROACH'),
                'title' => self::t('نهج متعدد المراحل: من التخطيط إلى التميّز التشغيلي', 'A multi-phase approach: from planning to operational excellence'),
                'title_short' => self::t('نهج متعدد المراحل', 'A multi-phase approach'),
                'subtitle' => self::t(
                    'نعمل جنباً إلى جنب مع المالك لفهم المتطلبات والأهداف، ثم نحوّلها إلى استراتيجيات قابلة للقياس والتحسين المستمر.',
                    'We work side by side with the owner to understand requirements and goals, then turn them into strategies that can be measured and continuously improved.',
                ),
            ],
            'offerings' => ['overline' => self::latin('OUR MODEL')],
            'tools' => ['overline' => self::latin('05 — TOOLS & ENABLERS')],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function projects(): array
    {
        return [
            'hero' => [
                'intro' => self::t(
                    'أكثر من 204 مشروع استشاري وإشرافي في التعليم والصحة والمياه والبنية التحتية، بشراكة مع جهات حكومية وخاصة رائدة.',
                    'More than 204 consulting and supervision projects in education, health, water and infrastructure, in partnership with leading government and private entities.',
                ),
                // Shorter variant from the 390 frame (Projects — Mobile 390).
                'intro_short' => self::t(
                    'أكثر من 204 مشروع استشاري وإشرافي في مختلف مناطق المملكة.',
                    'More than 204 consulting and supervision projects across the regions of the Kingdom.',
                ),
                'stat_labels' => [
                    'completed_projects' => self::t('مشروع منجز', 'Projects delivered'),
                    'project_volume' => self::t('حجم المشاريع', 'Project volume'),
                    'partnerships' => self::t('شراكات نوعية', 'Partnerships'),
                ],
            ],
            'detail' => [
                'overview_overline' => self::latin('PROJECT OVERVIEW'),
                'overview_title' => self::t('نظرة عامة على المشروع', 'Project overview'),
                'scope_title' => self::t('نطاق العمل', 'Scope of work'),
                'inquiry_title' => self::t('مشروع مشابه؟', 'A similar project?'),
                'inquiry_text' => self::t(
                    'شاركنا تفاصيل مشروعك وسيتواصل معك أحد خبرائنا خلال يومي عمل.',
                    'Share your project details and one of our experts will contact you within two working days.',
                ),
                'related_overline' => self::latin('RELATED PROJECTS'),
                'related_title' => self::t('مشاريع ذات صلة', 'Related projects'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function contact(): array
    {
        return [
            'overline' => self::latin('GET IN TOUCH'),
            'title' => self::t('لنبدأ الحديث عن مشروعك', 'Let’s talk about your project'),
            'intro' => self::t(
                'فريقنا من المهندسين والمستشارين جاهز لمساعدتك في رفع كفاءة أصولك ومرافقك. تواصل معنا عبر النموذج أو قنوات التواصل المباشرة.',
                'Our engineers and consultants are ready to help you raise the efficiency of your assets and facilities. Contact us through the form or our direct channels.',
            ),
            // Shorter variant from the 390 frame (Contact — Mobile 390).
            'intro_short' => self::t('فريقنا جاهز لمساعدتك في رفع كفاءة أصولك ومرافقك.', 'Our team is ready to help you raise the efficiency of your assets and facilities.'),
            'form_title' => self::t('أرسل استفسارك', 'Send your inquiry'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function media(): array
    {
        return [
            'title' => self::t('المركز الإعلامي', 'Media Center'),
            'intro' => self::t(
                'آخر أخبار عمران ومشاريعها ومشاركاتها في الفعاليات والمؤتمرات.',
                'The latest OMRAN news, projects, and participation in events and conferences.',
            ),
            'newsletter' => [
                'title' => self::t('اشترك في النشرة البريدية', 'Subscribe to our newsletter'),
                'text' => self::t('آخر الأخبار والمشاريع مباشرة إلى بريدك، مرة واحدة شهرياً.', 'The latest news and projects straight to your inbox, once a month.'),
            ],
            'article_cta' => [
                'title' => self::t('لديك مشروع مشابه؟', 'Have a similar project?'),
                'text' => self::t('تواصل مع خبرائنا لتصميم الحل الأنسب.', 'Talk to our experts to design the right solution.'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function layout(): array
    {
        return [
            'footer' => [
                'about' => self::t(
                    'شركة العمران المتقدم للاستشارات الهندسية — نبني كفاءة الأصول لبيئة تعليمية مستدامة، بدعم من خبرات مجموعة بن جارالله القابضة.',
                    'OMRAN Advanced Company for Engineering Consultancy — building asset efficiency for a sustainable educational environment, backed by the expertise of Bin Jarallah Holding Group.',
                ),
                'newsletter_text' => self::t('آخر المشاريع والأخبار مباشرة إلى بريدك.', 'The latest projects and news straight to your inbox.'),
                'tagline' => self::t('رؤية 2030 · المملكة العربية السعودية', 'Vision 2030 · Kingdom of Saudi Arabia'),
            ],
        ];
    }
}

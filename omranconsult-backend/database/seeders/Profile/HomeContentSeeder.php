<?php

namespace Database\Seeders\Profile;

use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Content\Infrastructure\Models\HeroSlide;
use App\Modules\Content\Infrastructure\Models\Statistic;

/**
 * Hero and section dividers (§3.1), statistics (§3.4), and home content blocks (§3.2–§3.18).
 */
class HomeContentSeeder extends ProfileSeeder
{
    public function run(): void
    {
        $this->heroSlides();
        $this->statistics();
        $this->contentBlocks();
    }

    private function heroSlides(): void
    {
        $slides = [
            ['cover', 'شركة العمران المتقدم للاستشارات الهندسية', 'OMRAN Advanced Company for Engineering Consultancy', null, null],
            ['hero', 'نبني كفاءة الأصول', 'Building asset efficiency', 'لبيئة تعليمة مستدامة', 'for a sustainable educational environment'],
            ['integrated_solutions', 'حلول متكاملة', 'Integrated solutions', 'بخبرات هندسية ونموذج عمل مرن', 'with engineering expertise and a flexible operating model'],
            ['projects', 'مشاريع تصنع الأثر', 'Projects that make an impact', 'خبرات هندسية في خدمة التنمية', 'Engineering expertise in the service of development'],
            ['projects_map', 'مشاريعنا', 'Our projects', 'حصلنا على +28 مشروع على مستوى المملكة', 'We have secured 28+ projects across the Kingdom'],
            ['vision', 'رؤية طموحة', 'An ambitious vision', 'نحو عمران مستدام', 'Toward sustainable development'],
            ['certifications', 'تميّز معتمد', 'Certified excellence', 'معايير نلتزم بها... وثقة نعزّزها', 'Standards we uphold... trust we strengthen'],
            ['governance', 'حوكمة تعزّز الثقة', 'Governance that builds trust', 'وممارسات تصون الاستدامة', 'and practices that safeguard sustainability'],
            ['services', 'خبرات متكاملة', 'Integrated expertise', 'نحو مشاريع ناجحة ومستدامة', 'Toward successful, sustainable projects'],
            ['asset_management', 'أصول مستدامة', 'Sustainable assets', 'إدارة ذكية... وكفاءة متجددة', 'Smart management... renewed efficiency'],
            ['engineering', 'هندسة تُلهم', 'Engineering that inspires', 'وتصاميم تصنع المستقبل', 'and designs that shape the future'],
            ['approach', 'تكامل المراحل', 'Integrated phases', 'من التخطيط إلى التميّز التشغيلي', 'From planning to operational excellence'],
            ['partners', 'شراكات نوعية', 'Distinguished partnerships', 'خبرات تتكامل... وقيمة تتعاظم', 'Complementary expertise... growing value'],
            ['clients', 'ثقة نعتزّ بها', 'Trust we cherish', 'عملاء نفخر بخدمتهم... ونجاحات نبنيها معًا', 'Clients we are proud to serve... successes we build together'],
        ];

        foreach ($slides as $index => [$key, $headlineAr, $headlineEn, $sublineAr, $sublineEn]) {
            HeroSlide::create([
                'key' => $key,
                'headline' => self::t($headlineAr, $headlineEn),
                'subline' => $sublineAr === null ? null : self::t($sublineAr, $sublineEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }
    }

    private function statistics(): void
    {
        $rows = [
            ['employees', 4500, null, null, null, 'موظف خبير، مهندس، إداري، وفني', 'Expert staff: engineers, administrators, and technicians'],
            ['project_volume', 15, self::t('ريال', 'SAR'), '+', 'billion', 'حجم المشاريع لآخر ثلاث سنوات', 'Project volume over the last three years'],
            ['partnerships', 10, null, '+', null, 'شراكات نوعية لتنفيذ المشاريع', 'Distinguished partnerships for project delivery'],
            ['local_content', 72.92, self::t('%', '%'), null, null, 'نسبة المحتوى المحلي للشركة', 'Local content ratio'],
            ['completed_projects', 204, null, '+', null, 'المشاريع المنجزة (استشاري، اشرافي)', 'Completed projects (consultancy and supervision)'],
        ];

        foreach ($rows as $index => [$key, $value, $unit, $suffix, $scale, $labelAr, $labelEn]) {
            Statistic::create([
                'key' => $key,
                'value' => $value,
                'unit' => $unit,
                'suffix' => $suffix,
                'scale' => $scale,
                'label' => self::t($labelAr, $labelEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }
    }

    private function contentBlocks(): void
    {
        $blocks = [
            'about' => $this->about(),
            'education_goals' => $this->educationGoals(),
            'core_offerings' => $this->coreOfferings(),
            'flexible_model' => $this->flexibleModel(),
            'strategy' => $this->strategy(),
            'credentials' => $this->credentials(),
            'work_stages' => $this->workStages(),
            'esg' => $this->esg(),
            'tools' => $this->tools(),
            'engineering_design' => $this->engineeringDesign(),
            'multi_phase_approach' => $this->multiPhaseApproach(),
            'section_titles' => $this->sectionTitles(),
        ];

        $order = 1;
        foreach ($blocks as $sectionKey => $payload) {
            ContentBlock::create([
                'page' => 'home',
                'section_key' => $sectionKey,
                'payload' => $payload,
                'sort_order' => $order++,
                ...self::published(),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function about(): array
    {
        return [
            'heading' => self::t('عن شركة العمران', 'About OMRAN'),
            'body' => [
                self::t(
                    'نحن شركة استشارية مصنفة من الدرجة الأولى تدعم التكامل في إدارة الأصول والمرافق وأعمال التطوير والأتمتة بالمملكة لأكثر من 21 عاما، مدعومة بخبرات مجموعة بن جارالله القابضة الممتدة لأكثر من 50 عاماً، والتي تضم قطاعات الإنشاءات، والدراسات والتصاميم، والتطوير العقاري، وإدارة المرافق والتشغيل والصيانة.',
                    'We are a first-grade classified consultancy that has supported integrated asset and facility management, development, and automation in the Kingdom for more than 21 years, backed by the expertise of Bin Jarallah Holding Group, which spans more than 50 years across construction, studies and design, real estate development, and facility management and operation and maintenance.',
                ),
                self::t(
                    'نمتلك الخبرة العملية في إدارة الأصول والمرافق من خلال الإشراف على مشاريع إدارة المرافق المتكاملة IFM لدى شركة تطوير للمبانيTBC ، وكذلك انشاء منصة OSOOL | OSOOL 360، وإسهامنا في رفع مستوى النضج المؤسسي لدى وزارة البيئة والمياه والزراعة في مجال إدارة الأصول والمرافق، إلى جانب مبنى أمانة منطقة الرياض، والمستشفى التعليمي بجازان، ومستشفيات الحياة الوطني، ومشروعات أرسيلور ميتال والتطوير العقاري.',
                    'We bring hands-on experience in asset and facility management through supervising integrated facility management (IFM) projects for Tatweer Buildings Company (TBC), building the OSOOL | OSOOL 360 platform, and helping raise institutional maturity in asset and facility management at the Ministry of Environment, Water and Agriculture, as well as work on the Riyadh Region Municipality building, the teaching hospital in Jazan, Al Hayat National Hospitals, ArcelorMittal projects, and real estate development.',
                ),
                self::t(
                    'يعتمد نهجنا على تطبيق أحدث الممارسات الوطنية والعالمية وفق الدليل الوطني لإدارة الأصول والمرافق، ومعايير ISO 55001 ISO 41001 - إلى جانب توظيف حلول رقمية متقدمة مثل أنظمة CAFM، ونظم المعلومات الجغرافية GIS، ولوحات المؤشرات التنفيذية، لربط البيانات التشغيلية بقرارات الإدارة، وتحسين دورة حياة الأصول.',
                    'Our approach applies the latest national and international practices in line with the National Asset and Facility Management Manual and the ISO 55001 and ISO 41001 standards, alongside advanced digital solutions such as CAFM systems, geographic information systems (GIS), and executive dashboards, to connect operational data to management decisions and improve the asset lifecycle.',
                ),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function educationGoals(): array
    {
        $items = [
            ['الإسهام', 'Contributing', 'في تمكين البيئة التعليمية، عبر حلول متكاملة ومبتكرة نحو تمكين كل متعلم من المنافسة عالميًا.', 'to empowering the educational environment through integrated, innovative solutions that enable every learner to compete globally.'],
            ['تقديم', 'Providing', 'إمكانيات استشارية متقدمة داعمة لإمكانيات شركة تطوير التعليم.', 'advanced consulting capabilities that support the capabilities of Tatweer Education Company.'],
            ['تعزيز', 'Strengthening', 'الكوادر الفنية والإدارية العاملة على إدارة الأصول والمرافق التعليمية، عبر برامج تأهيل وتمكين مستدام.', 'the technical and administrative staff working in educational asset and facility management, through sustainable qualification and empowerment programs.'],
            ['رفع الكفاءة', 'Improving the efficiency', 'التشغيلية وخفض التكاليف التشغيلية وإطالة العمر الافتراضي للأصول.', 'of operations, reducing operating costs, and extending the useful life of assets.'],
            ['تطوير', 'Developing', 'نموذج مؤسسي موحّد لإدارة أصول ومرافق المنشآت التعليمية، يستند إلى معايير الدليل الوطني لإدارة الأصول.', 'a unified institutional model for managing the assets and facilities of educational establishments, based on the standards of the National Asset Management Manual.'],
            ['تعزيز', 'Strengthening', 'الأثر التنموي للبيئة التعليمية، بما يخدم مستهدفات رؤية المملكة.', 'the developmental impact of the educational environment in support of the Kingdom\'s Vision targets.'],
            ['إنشاء', 'Establishing', 'سجل رقمي مركزي ودقيق لأصول المدارس والمنشآت التعليمية، يدعم القرار المؤسسي في الإحلال والتجديد والتخطيط الاستثماري.', 'an accurate, central digital register of the assets of schools and educational establishments that supports institutional decisions on replacement, renewal, and investment planning.'],
        ];

        return [
            'section_title' => self::t('أعمالنا', 'Our work'),
            'items' => array_map(fn (array $item): array => [
                'lead' => self::t($item[0], $item[1]),
                'body' => self::t($item[2], $item[3]),
            ], $items),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function coreOfferings(): array
    {
        return [
            'section_title' => self::t('عروضنا الأساسية', 'Our core offerings'),
            'items' => $this->titles([
                ['برامج التمكين', 'Enablement programs'],
                ['إدارة العمليات المعقدة', 'Complex operations management'],
                ['الاستشارات الهندسية', 'Engineering consulting'],
                ['إدارة القوي العاملة والافراد', 'Workforce and personnel management'],
                ['الابتكار من التحليلات', 'Innovation through analytics'],
                ['تجربة التواصل مع العملاء', 'Customer engagement experience'],
                ['البنية التحتية وإدارة الأصول', 'Infrastructure and asset management'],
            ]),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function flexibleModel(): array
    {
        return [
            'section_title' => self::t('النموذج المرن', 'The flexible model'),
            'items' => $this->titles([
                ['وفرات التكاليف', 'Cost savings'],
                ['النهج التوجيهي التدريبي', 'Coaching and mentoring approach'],
                ['التركيز على التسليم', 'Focus on delivery'],
                ['الخيارات المدفوعة بالتكنولوجيا', 'Technology-driven options'],
                ['مضاعفة الموظفين', 'Staff augmentation'],
            ]),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function strategy(): array
    {
        return [
            'vision' => [
                'title' => self::t('الرؤية', 'Vision'),
                'body' => self::t(
                    'العمل دائما وباستمرار على دارسة وتقديم الحلول الهندسية والادارية المتكاملة والغير تقليدية بما يتماشى مع متطلبات المالك من تصميمات عصرية واقتصادية متقيدين بأعلى معايير الجودة والنظم التكنولوجية والتقنيات الحديثة.',
                    'To continuously study and deliver integrated, unconventional engineering and management solutions that meet owners\' requirements for modern, economical designs, while adhering to the highest quality standards, technological systems, and modern techniques.',
                ),
            ],
            'mission' => [
                'title' => self::t('الرسالة', 'Mission'),
                'body' => self::t(
                    'الحرص الدائم على إرضاء العملاء وتصميم مشاريعهم بشكل مبدع وآمن طبقاً للمعايير المحلية والعالمية وتقديم حلول الأعمال لتحسين وضبط العمليات والنماذج التشغيلية، من خلال توفير الكفاءات والخبرات الهندسية والإدارية وإدارة تنفيذ المشاريع',
                    'To consistently satisfy our clients and design their projects creatively and safely in accordance with local and international standards, and to provide business solutions that improve and control processes and operating models by providing engineering and management talent and expertise and managing project execution',
                ),
            ],
            'objectives' => [
                'title' => self::t('الأهداف', 'Objectives'),
                'body' => self::t(
                    'التطوير المستمر والتوسع بشكل أكبر مع الحفاظ على الأداء المتميز لأعمالنا.',
                    'Continuous development and further expansion while maintaining the outstanding performance of our work.',
                ),
            ],
        ];
    }

    /**
     * Section headings and intros for licenses and certificates (§3.9–§3.10).
     *
     * @return array<string, mixed>
     */
    private function credentials(): array
    {
        return [
            'licenses_title' => self::t('التراخيص', 'Licenses'),
            'licenses_intro' => self::t(
                'نفخر بالتزامنا بالامتثال باللوائح التنظيمية، وحصولنا على جميع التراخيص والشهادات اللازمة لتقديم الخدمات الاستشارية.',
                'We take pride in our commitment to regulatory compliance and in holding all the licenses and certificates required to provide consulting services.',
            ),
            'certificates_title' => self::t('الشهادات والعضويات', 'Certificates and memberships'),
            'certificates_intro' => self::t(
                'حصلت شركة العمران المتقدم على شهادات الأيزو (ISO) الخاصة بجودة الأعمال المقدمة',
                'OMRAN Advanced Company holds ISO certifications for the quality of the work it delivers',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function workStages(): array
    {
        $stages = [
            ['مرحلة البناء', 'Construction phase', [['التصاريح', 'Permits'], ['التصميم', 'Design'], ['التشييد', 'Construction']]],
            ['مرحلة التسليم', 'Handover phase', [['اعتمادات الأعمال', 'Work approvals'], ['الامتثال لمعايير المباني الخضراء', 'Compliance with green building standards']]],
            ['مرحلة التشغيل', 'Operation phase', [['الأداء التشغيلي', 'Operational performance'], ['رفع الكفاءة', 'Efficiency improvement'], ['إعادة التأهيل', 'Rehabilitation']]],
        ];

        return [
            'stages' => array_map(fn (array $stage): array => [
                'title' => self::t($stage[0], $stage[1]),
                'items' => array_map(fn (array $item): array => self::t($item[0], $item[1]), $stage[2]),
            ], $stages),
            'coverage' => [
                'heading' => self::t('تغطيتنا', 'Our coverage'),
                'body' => self::t(
                    'يقدم فريق شركة العمران خدمات استشارية متخصصة في إدارة الأصول والمرافق، تشمل التخطيط والإشراف وإدارة وتشغيل وصيانة الأصول، وتطوير الاستراتيجيات التشغيلية، ورفع كفاءة الأداء، والإشراف على مزودي الخدمات، وتطبيق أفضل الممارسات والمعايير العالمية، بما يحقق استدامة الأصول وتعظيم قيمتها التشغيلية للجهات الحكومية في المملكة.',
                    'OMRAN\'s team provides specialized consulting services in asset and facility management, covering the planning, supervision, management, operation, and maintenance of assets; developing operational strategies; improving performance efficiency; supervising service providers; and applying international best practices and standards, to ensure asset sustainability and maximize operational value for government entities in the Kingdom.',
                ),
            ],
        ];
    }

    /**
     * Pillar titles are stored as printed (duplicate «المعايير البيئية», «الحكومة»); see content_disputes.
     *
     * @return array<string, mixed>
     */
    private function esg(): array
    {
        $pillars = [
            ['المعايير البيئية', 'Environmental Standards', [['استقرار المناخ', 'Climate stability'], ['إدارة النفايات', 'Waste management'], ['الموارد', 'Resources']]],
            ['الحكومة', 'Government', [['مكافحة الفساد', 'Anti-corruption'], ['الشفافية', 'Transparency'], ['إدارة المخاطر', 'Risk management']]],
            ['المعايير البيئية', 'Environmental Standards', [['الصحة والسلامة', 'Health and safety'], ['إدارة الكوادر', 'Workforce management'], ['التنوع', 'Diversity']]],
        ];

        return [
            'section_title' => self::t('التزامنا بالقوانين والممارسات', 'Our commitment to laws and practices'),
            'body' => [
                self::t(
                    'في شركة العمران المتقدم نؤكد التزامنا التام بقيم ومبادئ الصحة والسلامة والبيئة والجودة، ونعمل وفق اللوائح المحلية وأفضل الممارسات المرتبطة بالمعايير البيئية والاجتماعية والحوكمة ESG',
                    'At OMRAN Advanced Company, we affirm our full commitment to the values and principles of health, safety, environment, and quality, and we operate in line with local regulations and best practices related to environmental, social, and governance (ESG) standards',
                ),
                self::t(
                    'ونحرص على تطبيق هذه المبادئ في بيئة عمل مهنية ومتنوعة الكوادر، بما يعزز الثقة ويعكس مستوى المسؤولية المؤسسية لدينا. كما نعمل على تطوير برامج وإجراءات تشغيلية ترفع من مستوى الامتثال وتدعم الأهداف الرئيسية للمشاريع، مع تحقيق أعلى معايير النزاهة والمصداقية في جميع مراحل العمل.',
                    'We apply these principles in a professional work environment with diverse talent, strengthening trust and reflecting our level of corporate responsibility. We also develop operational programs and procedures that raise compliance and support the main objectives of projects, while upholding the highest standards of integrity and credibility at every stage of work.',
                ),
                self::t(
                    'ويأتي ذلك من خلال اعتماد أنظمة مراقبة فعّالة، ورفع الوعي بالسلامة والالتزام، وتطوير ثقافة داخلية تُعلي من قيمة الأداء الأخلاقي وحماية البيئة، بما يضمن تحسناً مستمراً ونتائج تشغيلية أكثر كفاءة واستدامة.',
                    'We achieve this by adopting effective monitoring systems, raising awareness of safety and compliance, and developing an internal culture that values ethical performance and environmental protection, ensuring continuous improvement and more efficient, sustainable operational results.',
                ),
            ],
            'pillars' => array_map(fn (array $pillar): array => [
                'title' => self::t($pillar[0], $pillar[1]),
                'items' => array_map(fn (array $item): array => self::t($item[0], $item[1]), $pillar[2]),
            ], $pillars),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function tools(): array
    {
        $items = [
            ['سيارات حديثة', 'Modern vehicles', 'تُستخدم سيارات سيدان حديثة لتسهيل تنقلات فرق العمل بين المواقع، ودعم أعمال الإشراف والمتابعة الميدانية، وتسهم في الوصول إلى مواقع العمل بكفاءة ومرونة، وسرعة متابعة الأعمال، وتنسيق الجهود الميدانية، بما يدعم تلبية احتياجات العمل.', 'Modern sedans make it easier for teams to move between sites and support field supervision and follow-up, providing efficient and flexible access to work sites, faster follow-up, and coordinated field efforts that meet work needs.'],
            ['جهاز TOTAL STATION', 'TOTAL STATION', 'يتكون جهاز توتال ستيشن من جهاز ثيودوليت الكترونيا وجهاز قياس المسافة الالكتروني EDM ومعالج صغير به وحدة ذاكرة باستخدام هذه الأداة من الممكن معرفة احداثيات العاكس الذي يضبط الشعيرات المتقاطعة للأداة وفي نفس الوقت قياس الزوايا الأفقية ومسافات الانحدار', 'A total station combines an electronic theodolite, an electronic distance measurement (EDM) device, and a small processor with a memory unit. With this instrument, the coordinates of the reflector aligned with the crosshairs can be determined while horizontal angles and slope distances are measured at the same time'],
            ['جهاز رفع مساحي GPS STATION', 'GPS STATION survey instrument', 'يُستخدم جهاز الرفع المساحي في توقيع النقاط والخطوط ومنحنيات الطرق، كما يتيح تصدير واستيراد البيانات بالعديد من صيغ الملفات الشهيرة، مثل DXF وDWG وSDR، مما يسهّل تبادل البيانات المساحية والاستفادة منها في أعمال المشروع المختلفة.', 'The survey instrument is used to set out points, lines, and road curves, and it exports and imports data in many common file formats such as DXF, DWG, and SDR, making survey data easy to exchange and use across project work.'],
            ['أجهزة كمبيوتر مكتبية ومحمولة', 'Desktop and laptop computers', 'تُستخدم أجهزة الكمبيوتر المكتبية والمحمولة لدعم أعمال المشروع المكتبية والميدانية، وتسهيل إعداد المستندات والتقارير، وتنظيم البيانات والملفات وتبادلها بين فريق العمل، بما يسهم في متابعة الأعمال وتنسيق المهام وإنجاز المتطلبات اليومية بكفاءة ومرونة.', 'Desktop and laptop computers support the project\'s office and field work, making it easier to prepare documents and reports and to organize and share data and files across the team, which helps track work, coordinate tasks, and complete daily requirements efficiently and flexibly.'],
            ['طابعة HP 63', 'HP 63 printer', 'تُستخدم طابعة HP 63 لدعم الأعمال المكتبية للمشروع، من خلال طباعة المستندات والتقارير والنماذج اللازمة لسير العمل، بما يسهّل تجهيز الوثائق وتداولها بين أعضاء الفريق، ويساعد على تنظيم الأعمال ومتابعة متطلبات المشروع اليومية بكفاءة ومرونة.', 'The HP 63 printer supports the project\'s office work by printing the documents, reports, and forms the workflow needs, making documents easier to prepare and circulate among team members and helping organize work and track daily project requirements efficiently and flexibly.'],
            ['ماكينة تصوير ملونة', 'Color photocopier', 'تُستخدم ماكينة التصوير الملونة لتصوير المستندات والوثائق بمقاسات A3 وA4 وA0، بما يدعم تجهيز التقارير والمخططات اللازمة لأعمال المشروع، ويسهّل توفير نسخ ورقية لفريق العمل، ويسهم في تنظيم المستندات وتداولها بما يلبي متطلبات العمل اليومية.', 'The color photocopier copies documents in A3, A4, and A0 sizes, supporting the preparation of reports and drawings for project work, providing paper copies for the team, and helping organize and circulate documents to meet daily work requirements.'],
            ['سيارات دفع رباعي', 'Four-wheel-drive vehicles', 'يتم توفير أربع سيارات دفع رباعي للمشروع، لدعم تنقلات فريق العمل والوصول إلى مواقع العمل المختلفة، بما يسهم في تسهيل أعمال الإشراف والمتابعة الميدانية، ويساعد على تنسيق الزيارات وإنجاز المهام المرتبطة بالمشروع بكفاءة ومرونة.', 'Four four-wheel-drive vehicles are provided for the project to support team movement and access to different work sites, making field supervision and follow-up easier and helping coordinate visits and complete project tasks efficiently and flexibly.'],
            ['جهاز بصمة للحضور والانصراف', 'Biometric attendance device', 'يُستخدم جهاز البصمة لإدارة الحضور والانصراف عبر الويب، بما يسهّل متابعة سجلات فريق العمل وتنظيم بيانات الدوام، ويساعد على الاطلاع على معلومات الحضور والانصراف، ودعم الأعمال الإدارية المرتبطة بمتابعة الدوام خلال فترة المشروع.', 'The biometric device manages attendance over the web, making it easier to track team records and organize working-hours data, giving access to attendance information, and supporting the administrative work of tracking attendance during the project.'],
            ['طائرة تصوير درون', 'Camera drone', 'تُستخدم طائرة الدرون لتوثيق المشاريع باحترافية عالية، من خلال التقاط صور للمواقع من زوايا علوية، بما يساعد على متابعة الأعمال وإظهار تفاصيل المواقع، ودعم توثيق مراحل المشروع وتوفير مواد مرئية يمكن الرجوع إليها عند الحاجة.', 'The drone documents projects professionally by capturing aerial images of sites, helping track work and show site details, and supporting documentation of project phases with visual material for later reference.'],
            ['البرامج الهندسية', 'Engineering software', 'يتم توفير برامج هندسية حديثة ومتطورة لدعم الأعمال الفنية المرتبطة بالمشروع، والمساعدة في إعداد الملفات والمخططات وتنظيم البيانات الهندسية، بما يسهّل عمل الفريق ومتابعة المهام الفنية، ويسهم في إنجاز متطلبات المشروع بكفاءة.', 'Modern, advanced engineering software is provided to support the project\'s technical work and help prepare files and drawings and organize engineering data, making the team\'s work and the tracking of technical tasks easier and helping meet project requirements efficiently.'],
        ];

        return [
            'section_title' => self::t('الأدوات والممكنات', 'Tools and enablers'),
            'items' => array_map(fn (array $item): array => [
                'title' => self::t($item[0], $item[1]),
                'body' => self::t($item[2], $item[3]),
            ], $items),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function engineeringDesign(): array
    {
        return [
            'section_title' => self::t('الهندسة والتصميم', 'Engineering and design'),
            'body' => self::t(
                'هندسة وتصميم المرافق والإنشاءات (D3) والتخطيط الحضري، وإعداد الرفوعات المساحية والمخططات الفنية (إنشائية، كهربائية، ميكانيكية، الأمن والسلامة، كفاءة الطاقة، وتقنية المعلومات)، إلى جانب تصميمات داخلية وخارجية تتميز بالمرونة وتراعي الأثر البيئي المستدام. كما نعمل على تطوير نماذج تصميمية متقدمة تعتمد على محاكاة ثلاثية الأبعاد لتقديم رؤية واضحة وشاملة قبل التنفيذ، مما يسهم في رفع جودة القرارات التصميمية وتقليل الأخطاء أثناء التنفيذ. ونحرص على دمج أفضل الممارسات العالمية في التخطيط العمراني وإدارة المرافق لضمان حلول متوازنة تجمع بين الكفاءة التشغيلية والابتكار الجمالي، مع توفير خيارات تصميمية قابلة للتطوير تلائم احتياجات مختلف القطاعات وتدعم الاستدامة طويلة المدى.',
                'Engineering and design of facilities and structures (D3) and urban planning, preparing land surveys and technical drawings (structural, electrical, mechanical, safety and security, energy efficiency, and information technology), along with flexible interior and exterior designs that consider sustainable environmental impact. We also develop advanced design models based on three-dimensional simulation to give a clear, comprehensive view before execution, improving the quality of design decisions and reducing errors during construction. We integrate global best practices in urban planning and facility management to deliver balanced solutions that combine operational efficiency with aesthetic innovation, while offering scalable design options that suit the needs of different sectors and support long-term sustainability.',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function multiPhaseApproach(): array
    {
        return [
            'section_title' => self::t('نهج متعدد المراحل', 'A multi-phase approach'),
            'steps' => [
                self::t('الخدمات الاستشارية وإدارة المشاريع بنهج متعدد المراحل', 'Consulting and project management services with a multi-phase approach'),
                self::t('العمل جنباً إلى جنب مع المالك من أجل فهم المتطلبات التنظيمية والحالة والأهداف الحالية الأساسية.', 'Working side by side with the owner to understand the regulatory requirements, the current situation, and the core objectives.'),
                self::t('وضع استراتيجيات إدارة المشاريع والعقود بناء على العناصر الإنشائية والمالية الموحدة لجميع الأطراف المعنية، واستراتيجيات إدارة الأصول والمرافق وعمليات التشغيل والصيانة بناء على العناصر التشغيلية بما يحقق التميز التشغيلي.', 'Developing project and contract management strategies based on construction and financial elements shared by all stakeholders, and asset and facility management and operation and maintenance strategies based on operational elements, to achieve operational excellence.'),
                self::t('الجمع بين الاستراتيجية ومعايير EXPRO واجراء تقييم النضج لمراجعة أي ثغرات بالهيكل والقدرات والتقنيات والأداء.', 'Combining the strategy with EXPRO standards and conducting a maturity assessment to review any gaps in structure, capabilities, technologies, and performance.'),
                self::t('تحديد أي ثغرات واقتراح فرص للتحسين من منظور البيانات والأشخاص والعمليات والتكنولوجيا عبر سلسلة التوريد الخاصة بهم.', 'Identifying any gaps and proposing improvement opportunities from the perspective of data, people, processes, and technology across their supply chain.'),
                self::t('تصميم نظام شامل وتنفيذه لقياس الأداء وإنشاء مصفوفة يمكن استخدامها من قبل جميع الأطراف المعنية للتحسين المستمر.', 'Designing and implementing a comprehensive performance measurement system and creating a matrix that all stakeholders can use for continuous improvement.'),
            ],
            'outputs' => [
                self::t('إعداد دراسات الأمن والسلامة للوضع الحالي والمستقبلي ومعايير التطبيق', 'Safety and security studies of the current and future state, with application standards'),
                self::t('إعداد الدراسات التنظيمية لحوكمة أعمال إدارة العقود ورفع مستوي الإلتزام', 'Organizational studies for contract management governance and higher compliance'),
                self::t('إعداد إستراتيجيات وبرامج التحول في مجال إدارة المشاريع وصياغة العقود', 'Transformation strategies and programs for project management and contract drafting'),
                self::t('إعداد الدراسات الهندسية للوضع الحالي والمستهدف وتحليل الفجوات', 'Engineering studies of the current and target state, with gap analysis'),
                self::t('نموذج عمل متوافق مع الدليل الوطني لإدارة المشاريع وإدارة الأصول والمرافق وكوادر بشرية متنوعة ومدربة ومؤهلة لإستلام المهام', 'An operating model aligned with the national manuals for project management and for asset and facility management, with diverse, trained, and qualified staff ready to take on the work'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function sectionTitles(): array
    {
        return [
            'statistics' => self::t('أرقام وتواريخ شركة العمران المتقدم', 'OMRAN Advanced Company figures and milestones'),
            'experts' => self::t('خبراء شركة العمران المتقدم', 'OMRAN Advanced Company experts'),
            'org_chart' => self::t('الهيكل التنظيمي', 'Organizational chart'),
            'featured_projects' => self::t('أبرز المشاريع', 'Featured projects'),
            'org_groups' => [
                'board' => self::t('مجلس الإدارة', 'Board of directors'),
                'board_committees' => self::t('لجان مجلس الإدارة والمكتب التنفيذي', 'Board committees and executive office'),
                'executive_management' => self::t('الإدارة التنفيذية', 'Executive management'),
                'committees' => self::t('اللجان', 'Committees'),
                'projects' => self::t('المشاريع', 'Projects'),
                'planning_control' => self::t('التخطيط والرقابة', 'Planning and control'),
            ],
        ];
    }

    /**
     * @param  array<int, array{0: string, 1: string}>  $pairs
     * @return array<int, array{title: array{ar: string|null, en: string|null}}>
     */
    private function titles(array $pairs): array
    {
        return array_map(fn (array $pair): array => ['title' => self::t($pair[0], $pair[1])], $pairs);
    }
}

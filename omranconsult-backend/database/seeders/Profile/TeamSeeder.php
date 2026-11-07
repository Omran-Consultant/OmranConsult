<?php

namespace Database\Seeders\Profile;

use App\Modules\Team\Domain\OrgGroup;
use App\Modules\Team\Infrastructure\Models\OrgPosition;
use App\Modules\Team\Infrastructure\Models\TeamMember;

/**
 * Experts (§3.12) and the organizational chart (§3.19: 29 positions, 21 people).
 * Bios are seeded as printed under each name (P12). Bio A describes عبدالرحمن المقبل and Bio B describes
 * وسيم اصفهان; the profile also prints them under محمد مسعد and بسام جورية (disputes).
 * Only the reporting lines drawn from the CEO box are linked; the rest stay null (dispute).
 */
class TeamSeeder extends ProfileSeeder
{
    private const BIO_A_AR = 'متخصص في الاستشارات التقنية وتحليل البيانات وإدارة المشاريع، عمل لدى شركة العمران المتقدم وعدد من الوزارات، شملت وزارة البيئة والمياه والزراعة، ووزارة الصحة، ووزارة الإسكان، وتولى تقديم الحلول التقنية ومتابعة تنفيذ الأعمال ضمن الجداول الزمنية المحددة. يمتلك خبرة في تطوير أنظمة تقنية المعلومات، وتصميم لوحات المعلومات، والتحول الرقمي، إضافة إلى معالجة التحديات التقنية ورفع كفاءة الهياكل والعمليات المؤسسية. كما أسهم في إعداد التوجهات والخطط وصياغة الأهداف، وتدريب فرق العمل ونقل المعرفة، بما يدعم جودة المخرجات واستدامة التطوير.';

    private const BIO_A_EN = 'A specialist in technical consulting, data analysis, and project management. He has worked with OMRAN Advanced Company and several ministries, including the Ministry of Environment, Water and Agriculture, the Ministry of Health, and the Ministry of Housing, delivering technical solutions and following up on work within set timelines. He has experience in developing information technology systems, designing dashboards, and digital transformation, as well as resolving technical challenges and improving the efficiency of organizational structures and processes. He has also contributed to setting directions and plans, formulating objectives, training teams, and transferring knowledge, supporting output quality and sustainable development.';

    private const BIO_B_AR = 'خبير دولي متخصص في البنية التحتية والإدارة الهندسية وتطبيق معايير الجودة والتقنيات الحديثة، حاصل على ماجستير إدارة الأعمال من المعهد الأوروبي «إنسياد» بفرنسا، وماجستير الإدارة الهندسية من جامعة لويزيانا بالولايات المتحدة. شغل سابقاً منصب الرئيس التنفيذي لشركة Bureau Veritas، ويعمل حالياً لدى شركة العمران المتقدم. يمتلك خبرة في تقديم الحلول والممارسات التي تعزز الجودة والكفاءة والاستدامة في قطاعات الطاقة والمياه والصحة والبيئة، وإعداد تقارير متابعة الأعمال وإدارة قواعد البيانات، ونمذجة التصاميم (3D BIM–ArcGIS–AutodesK Civil).';

    private const BIO_B_EN = 'An international expert in infrastructure, engineering management, and the application of quality standards and modern technologies. He holds an MBA from INSEAD in France and a master\'s degree in engineering management from the University of Louisiana in the United States. He previously served as chief executive of Bureau Veritas and currently works with OMRAN Advanced Company. He has experience delivering solutions and practices that enhance quality, efficiency, and sustainability in the energy, water, health, and environment sectors, preparing work progress reports, managing databases, and design modeling (3D BIM–ArcGIS–AutodesK Civil).';

    public function run(): void
    {
        $this->experts();
        $this->orgChart();
    }

    private function experts(): void
    {
        $experts = [
            ['محمد مسعد', 'Mohammed Mosaad', 'مستشار الدراسات والتصميم', 'Studies and Design Consultant', 25, self::BIO_A_AR, self::BIO_A_EN],
            ['بسام جورية', 'Bassam Jouriyeh', 'خبير واستشاري ، في الهندسة المدنية والمائية', 'Expert and Consultant in Civil and Water Engineering', 35, self::BIO_B_AR, self::BIO_B_EN],
            [
                'د. محمد عبدالعليم', 'Dr. Mohammed Abdelalim', 'خبير الدراسات الهيدرولوجية وتكنولوجيا الاستشعار', 'Expert in Hydrological Studies and Sensing Technology', 15,
                'خبير واستشاري متخصص في الدراسات الهيدرولوجية والجيومورفولوجية وتقييم أخطار السيول، حاصل على درجة الدكتوراه في الجيومورفولوجيا التطبيقية والاستشعار عن بعد، شارك في إعداد وتنفيذ ومراجعة العديد من الدراسات والمشاريع المرتبطة بإدارة وتنمية موارد المياه السطحية والحماية من أخطار السيول، وتوظيف الاستشعار عن بعد ونظم المعلومات الجغرافية في بناء قواعد البيانات والتحليلات المكانية والنماذج الرقمية الداعمة للتخطيط واتخاذ القرار، إلى جانب خبرته، باستخدام البرامج المتخصصة:- ArcGIS Pro – ArcGIS – HEC-HMS – HEC-RAS – HyfranPlus – SPSS.',
                'An expert and consultant specializing in hydrological and geomorphological studies and flood-risk assessment. He holds a PhD in applied geomorphology and remote sensing and has taken part in preparing, implementing, and reviewing many studies and projects on managing and developing surface water resources and protecting against flood hazards, using remote sensing and geographic information systems to build databases, spatial analyses, and digital models that support planning and decision-making. He is experienced with specialized software: ArcGIS Pro – ArcGIS – HEC-HMS – HEC-RAS – HyfranPlus – SPSS.',
            ],
            ['عبدالرحمن المقبل', 'Abdulrahman Al-Muqbil', 'مستشار تحليل البيانات', 'Data Analysis Consultant', 25, self::BIO_A_AR, self::BIO_A_EN],
            ['وسيم اصفهان', 'Waseem Asfahan', 'خبير الإدارة الهندسية والجودة', 'Expert in Engineering Management and Quality', 30, self::BIO_B_AR, self::BIO_B_EN],
            [
                'د/ أميرة البرتقالي', 'Dr. Amira Al-Burtuqali', 'خبير التصاميم والهويات المعمارية', 'Expert in Architectural Design and Identity', 15,
                'خبرة واسعة في تطوير الحلول المعمارية والحضرية، وتصميم المساحات الخارجية واللاند سكيب، والتخطيط الاستراتيجي، والاستدامة، بما يؤهلها للمساهمة بفاعلية في تطوير هوية معمارية متكاملة وموحدة تربط بين الطابع المؤسسي، والسياق المحلي، والمتطلبات الوظيفية والتشغيلية للمشاريع. تتميز خبرتها بالقدرة على تحويل الرؤية والهوية المؤسسية إلى مبادئ ومفردات تصميمية قابلة للتطبيق على مشاريع متعددة الأنماط والأحجام، مع مراعاة خصوصية الموقع، والبيئة المحيطة، وتجربة المستخدم، وجودة المشهد الحضري. كما تمتلك خبرة في إدارة وتنسيق المشاريع متعددة التخصصات،',
                'Extensive experience in developing architectural and urban solutions, designing outdoor spaces and landscape, strategic planning, and sustainability, qualifying her to contribute effectively to an integrated, unified architectural identity that connects corporate character, local context, and the functional and operational requirements of projects. Her expertise stands out in turning corporate vision and identity into design principles and vocabulary that apply to projects of many types and sizes, taking into account the site, the surrounding environment, user experience, and the quality of the urban landscape. She also has experience in managing and coordinating multidisciplinary projects,',
            ],
        ];

        foreach ($experts as $index => [$nameAr, $nameEn, $titleAr, $titleEn, $years, $bioAr, $bioEn]) {
            TeamMember::create([
                'name' => self::t($nameAr, $nameEn),
                'title' => self::t($titleAr, $titleEn),
                'bio' => self::t($bioAr, $bioEn),
                'years_experience' => $years,
                'is_expert' => true,
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }
    }

    private function orgChart(): void
    {
        $people = [
            'aljarallah' => ['د/ ناصر محمد آل جار الله', 'Dr. Nasser Mohammed Al Jarallah'],
            'hussein' => ['م/ محمود علي حسين', 'Eng. Mahmoud Ali Hussein'],
            'ahmed' => ['أ/ خليفة مصطفى أحمد', 'Mr. Khalifa Mustafa Ahmed'],
            'alshahrani' => ['أ/ محمد سعد محمد الشهراني', 'Mr. Mohammed Saad Mohammed Al-Shahrani'],
            'alzahrani' => ['م/ عبد الرحمن حميدان درويش الزهراني', 'Eng. Abdulrahman Humaidan Darwish Al-Zahrani'],
            'alhamed' => ['أ/ سالم حسين الحامد', 'Mr. Salem Hussein Al-Hamed'],
            'alotaibi' => ['أ/ تركي فيصل سعود الرويس العتيبي', 'Mr. Turki Faisal Saud Al-Ruwais Al-Otaibi'],
            'almutaa' => ['أ/ فواز محمد المطاع', 'Mr. Fawaz Mohammed Al-Mutaa'],
            'anouz' => ['أ/ محمد بن عمر عانوز', 'Mr. Mohammed bin Omar Anouz'],
            'alamoudi' => ['حسن عثمان العمودي', 'Hassan Othman Al-Amoudi'],
            'abdelghani' => ['وليد أنور عبد الغني', 'Walid Anwar Abdelghani'],
            'ragab' => ['باسم أحمد رجب', 'Basem Ahmed Ragab'],
            'alanazi' => ['م/ فارس عبد الله التمامي العنزي', 'Eng. Fares Abdullah Al-Tamami Al-Anazi'],
            'almaliki' => ['م/ محمد حسن المالكي', 'Eng. Mohammed Hassan Al-Maliki'],
            'aldreidi' => ['م/ السيد محمد السيد الدريدي', 'Eng. Elsayed Mohammed Elsayed Al-Dreidi'],
            'zaytoun' => ['م/ محمود محمد عبد الجواد زيتون', 'Eng. Mahmoud Mohammed Abdelgawad Zaytoun'],
            'ghoneim' => ['م/ أحمد محمود غنيم', 'Eng. Ahmed Mahmoud Ghoneim'],
            'masoud' => ['م/ محمد عبد الله مسعود', 'Eng. Mohammed Abdullah Masoud'],
            'shalaby' => ['د/ محمود السيد محمد آدم شلبي', 'Dr. Mahmoud Elsayed Mohammed Adam Shalaby'],
            'metwally' => ['د/ هشام محمد متولي', 'Dr. Hesham Mohammed Metwally'],
            'alkhulaifi' => ['أ/ علي محمد الخليفي', 'Mr. Ali Mohammed Al-Khulaifi'],
        ];

        $members = [];
        $order = 1;
        foreach ($people as $key => [$nameAr, $nameEn]) {
            $members[$key] = TeamMember::create([
                'name' => self::t($nameAr, $nameEn),
                'is_expert' => false,
                'sort_order' => 100 + $order++,
                ...self::published(),
            ]);
        }

        // [group, person key, Arabic title as printed, English title, reports to CEO]
        $positions = [
            [OrgGroup::Board, 'aljarallah', 'رئيس مجلس الإدارة', 'Chairman of the Board', false],
            [OrgGroup::Board, 'hussein', 'الرئيس التنفيذي', 'Chief Executive Officer', false],
            [OrgGroup::Board, 'ahmed', 'عضو مجلس إدارة (عضو مستقل)', 'Board Member (Independent Member)', false],
            [OrgGroup::Board, 'alshahrani', 'عضو مجلس إدارة مستقل', 'Independent Board Member', false],
            [OrgGroup::Board, 'alzahrani', 'عضو مجلس إدارة مستقل', 'Independent Board Member', false],
            [OrgGroup::BoardCommittees, 'alzahrani', 'المراجعة الداخلية - لجنة إدارة المراجعة والالتزام', 'Internal Audit – Audit and Compliance Committee', false],
            [OrgGroup::BoardCommittees, 'alshahrani', 'لجنة الترشيحات والمكافآت', 'Nominations and Remuneration Committee', false],
            [OrgGroup::BoardCommittees, 'alhamed', 'سكرتير تنفيذي', 'Executive Secretary', false],
            [OrgGroup::ExecutiveManagement, 'alotaibi', 'مدير الموارد البشرية', 'Human Resources Manager', true],
            [OrgGroup::ExecutiveManagement, 'almutaa', 'مدير الشؤون المالية والميزانية', 'Finance and Budget Manager', true],
            [OrgGroup::ExecutiveManagement, 'anouz', 'مدير المشتريات', 'Procurement Manager', true],
            [OrgGroup::ExecutiveManagement, 'alamoudi', 'مدير الخدمات اللوجستية', 'Logistics Services Manager', true],
            [OrgGroup::ExecutiveManagement, 'abdelghani', 'مدير الشؤون القانونية', 'Legal Affairs Manager', true],
            [OrgGroup::ExecutiveManagement, 'ragab', 'مدير تقنية المعلومات', 'Information Technology Manager', true],
            [OrgGroup::Committees, 'alotaibi', 'لجنة إدارة رأس المال البشري والتعاقب', 'Human Capital and Succession Committee', false],
            [OrgGroup::Committees, 'alanazi', 'لجنة إدارة المشاريع التشغيلية', 'Operational Projects Committee', false],
            [OrgGroup::Committees, 'anouz', 'لجنة المشتريات المركزية وسلاسل الإمداد', 'Central Procurement and Supply Chain Committee', false],
            [OrgGroup::Committees, 'alotaibi', 'مدير الموارد البشرية', 'Human Resources Manager', false],
            [OrgGroup::Committees, 'almaliki', 'لجنة إدارة المخاطر والاستدامة التشغيلية', 'Risk and Operational Sustainability Committee', false],
            [OrgGroup::Projects, 'alanazi', 'مدير إدارة المشاريع', 'Project Management Department Manager', false],
            [OrgGroup::Projects, 'aldreidi', 'مدير مشاريع الدعم الفني', 'Technical Support Projects Manager', false],
            [OrgGroup::Projects, 'zaytoun', 'مدير مشاريع التصاميم والمخرجات', 'Design and Deliverables Projects Manager', false],
            [OrgGroup::Projects, 'ghoneim', 'مدير مشاريع الأشراف', 'Supervision Projects Manager', false],
            [OrgGroup::Projects, 'masoud', 'مدير مشاريع إدارة المرافق', 'Facility Management Projects Manager', false],
            [OrgGroup::PlanningControl, 'shalaby', 'مدير إدارة المناقصات', 'Tenders Department Manager', false],
            [OrgGroup::PlanningControl, 'metwally', 'مدير التخطيط', 'Planning Manager', false],
            [OrgGroup::PlanningControl, 'ghoneim', 'مدير ضبط التكاليف', 'Cost Control Manager', false],
            [OrgGroup::PlanningControl, 'shalaby', 'مدير الصحة والسلامة والبيئة', 'Health, Safety, and Environment Manager', false],
            [OrgGroup::PlanningControl, 'alkhulaifi', 'مدير تطوير الأعمال', 'Business Development Manager', false],
        ];

        $ceo = null;
        foreach ($positions as $index => [$group, $person, $titleAr, $titleEn, $reportsToCeo]) {
            $position = OrgPosition::create([
                'team_member_id' => $members[$person]->id,
                'parent_id' => $reportsToCeo ? $ceo?->id : null,
                'group' => $group,
                'title' => self::t($titleAr, $titleEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);

            if ($person === 'hussein') {
                $ceo = $position;
            }
        }
    }
}

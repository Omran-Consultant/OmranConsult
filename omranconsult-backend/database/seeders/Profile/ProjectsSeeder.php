<?php

namespace Database\Seeders\Profile;

use App\Modules\Projects\Infrastructure\Models\Client;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;

/**
 * Clients (§3.21), owning entities and projects (§3.6), and map regions (§3.7).
 * The profile links no project to a region, so project_region stays empty (P11).
 */
class ProjectsSeeder extends ProfileSeeder
{
    public function run(): void
    {
        $clients = $this->clients();
        $this->projects($clients);
        $this->regions();
    }

    /**
     * @return array<string, Client> keyed by slug
     */
    private function clients(): array
    {
        // [slug|null, Arabic name|null, English name|null, in the profile's 30-client list]
        $rows = [
            ['ministry-of-environment-water-and-agriculture', 'وزارة البيئة والمياه والزراعة', 'Ministry of Environment, Water and Agriculture', true],
            ['general-irrigation-organization', 'المؤسسة العامة للري', 'General Irrigation Organization', true],
            ['ministry-of-municipalities-and-housing', 'وزارة البلديات والإسكان', 'Ministry of Municipalities and Housing', true],
            ['ministry-of-sport', 'وزارة الرياضة', 'Ministry of Sport', true],
            ['tatweer-buildings-company', 'شركة تطوير للمباني (TBC)', 'Tatweer Buildings Company (TBC)', true],
            ['ministry-of-health', 'وزارة الصحة', 'Ministry of Health', true],
            ['saudi-red-crescent-authority', 'هيئة الهلال الأحمر السعودي', 'Saudi Red Crescent Authority', true],
            ['aramco', 'أرامكو', 'Aramco', true],
            ['ministry-of-investment', 'وزارة الاستثمار', 'Ministry of Investment', true],
            ['state-properties-general-authority', 'الهيئة العامة لعقارات الدولة', 'State Properties General Authority', true],
            ['national-center-for-vegetation-cover-development', 'المركز الوطني لتنمية الغطاء النباتي ومكافحة التصحر', 'National Center for Vegetation Cover Development and Combating Desertification', true],
            ['riyad-bank', 'بنك الرياض', 'Riyad Bank', true],
            ['arasco', 'أراسكو', 'ARASCO', true],
            ['sdaia', 'الهيئة السعودية للبيانات والذكاء الاصطناعي', 'Saudi Data and AI Authority (SDAIA)', true],
            ['tawuniya', 'التعاونية', 'Tawuniya', true],
            ['ministry-of-culture', 'وزارة الثقافة', 'Ministry of Culture', true],
            ['national-center-for-water-efficiency-and-conservation', 'مائي — المركز الوطني لكفاءة وترشيد المياه', 'National Center for Water Efficiency and Conservation (MAEE)', true],
            ['cargill', 'Cargill', 'Cargill', true],
            ['gosi', 'التأمينات الاجتماعية', 'General Organization for Social Insurance (GOSI)', true],
            ['expro', 'هيئة كفاءة الإنفاق والمشروعات الحكومية', 'Expenditure and Projects Efficiency Authority (EXPRO)', true],
            // #21: emblem with scales, no printed name; matches the Ministry of Justice emblem on p.12 (dispute).
            ['ministry-of-justice', 'وزارة العدل', 'Ministry of Justice', true],
            ['general-court-of-audit', 'الديوان العام للمحاسبة', 'General Court of Audit', true],
            // #23: calligraphic mark, no readable name (dispute).
            [null, null, null, true],
            ['al-hayat-national-hospitals', 'مستشفيات الحياة الوطني', 'Al Hayat National Hospitals (HNH)', true],
            ['madinah-region-development-authority', 'هيئة تطوير منطقة المدينة المنورة', 'Madinah Region Development Authority', true],
            ['sekaya-charitable-foundation', 'مؤسسة سقاية الأهلية', 'Sekaya Charitable Foundation', true],
            ['mrooj', 'مؤسسة تنمية الغطاء النباتي الأهلية (مروج)', 'Vegetation Cover Development Foundation (Mrooj)', true],
            ['social-development-bank', 'بنك التنمية الاجتماعية', 'Social Development Bank', true],
            ['ministry-of-defense', 'وزارة الدفاع', 'Ministry of Defense', true],
            // #30: red emblem with palm and crossed swords, no readable name (dispute).
            [null, null, null, true],
            // Owning entity of four projects, not among the 30 clients (dispute).
            ['bin-jarallah-group-contracting', 'شركة مجموعة بن جار الله للمقاولات المحدودة', 'Bin Jarallah Group Contracting Company Ltd.', false],
        ];

        $clients = [];
        foreach ($rows as $index => [$slug, $nameAr, $nameEn, $listed]) {
            $client = Client::create([
                'slug' => $slug,
                'name' => $nameAr === null ? null : self::t($nameAr, $nameEn),
                'in_client_list' => $listed,
                'sort_order' => $index + 1,
                ...self::published(),
            ]);

            $clients[$slug ?? 'client-'.($index + 1)] = $client;
        }

        return $clients;
    }

    /**
     * @param  array<string, Client>  $clients
     */
    private function projects(array $clients): void
    {
        // [owner slug, project slug, Arabic title as printed, English title]
        $rows = [
            ['ministry-of-environment-water-and-agriculture', 'mewa-operation-and-maintenance-efficiency-consulting', 'تقديم الخدمات الاستشارية لرفع كفاءة عمليات التشغيل والصيانة – وزارة البيئة والمياه والزراعة.', 'Consulting services to improve operation and maintenance efficiency – Ministry of Environment, Water and Agriculture.'],
            ['ministry-of-environment-water-and-agriculture', 'dams-operation-and-maintenance-efficiency-consulting', 'تقديم الخدمات الاستشارية لرفع كفاءة عمليات التشغيل والصيانة للسدود.', 'Consulting services to improve the operation and maintenance efficiency of dams.'],
            ['ministry-of-environment-water-and-agriculture', 'mewa-small-projects-supervision-phase-one', 'الإشراف على المشاريع الصغيرة (المرحلة الأولى) بوزارة البيئة والمياه والزراعة.', 'Supervision of small projects (Phase One) at the Ministry of Environment, Water and Agriculture.'],
            ['ministry-of-environment-water-and-agriculture', 'water-conservation-solutions-mosques-and-schools-study', 'دراسة تطبيق الحلول الترشيدية لاستهلاك المياه على عينة من المساجد والمدارس (المرحلة الأولى- الثانية).', 'Study on applying water-conservation solutions to a sample of mosques and schools (Phases One and Two).'],
            ['ministry-of-environment-water-and-agriculture', 'cop16-technical-audit', 'مشروع التدقيق الفني على تنفيذ مشروع مؤتمر الأطراف لمكافحة التصحر COP16.', 'Technical audit of the delivery of the COP16 Conference of the Parties to Combat Desertification project.'],
            ['ministry-of-environment-water-and-agriculture', 'central-veterinary-laboratory-dhurma', 'التصميم والإشراف على إنشاء المختبر البيطري المركزي – ضرما – وزارة البيئة والمياه والزراعة.', 'Design and construction supervision of the Central Veterinary Laboratory – Dhurma – Ministry of Environment, Water and Agriculture.'],
            ['national-center-for-water-efficiency-and-conservation', 'efficiency-and-conservation-compliance-regulation', 'إعداد وبدء تطبيق اللائحة التنفيذية للمراقبة والالتزام بمعايير الكفاءة والترشيد.', 'Preparing and launching the executive regulation for monitoring compliance with efficiency and conservation standards.'],
            ['national-center-for-water-efficiency-and-conservation', 'technical-standards-unification', 'مشروع توحيد المعايير الفنية لدى المرشدين بالتعاون مع الجهات ذات العلاقة.', 'Project to unify technical standards among advisors, in cooperation with the relevant entities.'],
            ['general-irrigation-organization', 'irrigation-projects-design-framework-agreement', 'الاتفاقية الإطارية لتصميم مشاريع المؤسسة العامة للري.', 'Framework agreement for designing General Irrigation Organization projects.'],
            ['general-irrigation-organization', 'dam-projects-consulting-services', 'مشروع تقديم خدمات استشارية لمشاريع السدود في (جازان – عسير – نجران – الباحة – مكة المكرمة).', 'Consulting services for dam projects in Jazan, Asir, Najran, Al-Baha, and Makkah.'],
            ['bin-jarallah-group-contracting', 'king-faisal-university-operation-and-maintenance-efficiency', 'تقديم الخدمات الاستشارية لرفع كفاءة عمليات التشغيل والصيانة – جامعة الملك فيصل.', 'Consulting services to improve operation and maintenance efficiency – King Faisal University.'],
            ['bin-jarallah-group-contracting', 'king-saud-university-operation-and-maintenance-efficiency', 'تقديم الخدمات الاستشارية لرفع كفاءة عمليات التشغيل والصيانة- جامعة الملك سعود', 'Consulting services to improve operation and maintenance efficiency – King Saud University'],
            ['bin-jarallah-group-contracting', 'al-hayat-national-hospitals-operation-and-maintenance-supervision', 'الإشراف على تشغيل وصيانة مجموعة مستشفيات الحياة الوطني التابعة لمجموعة بن جار الله.', 'Supervision of operation and maintenance for the Al Hayat National Hospitals group, part of Bin Jarallah Group.'],
            ['bin-jarallah-group-contracting', 'bin-jarallah-facility-management-technical-support', 'الدعم الفني لبعض مشاريع التشغيل والصيانة وإدارة المرافق بمجموعة بن جار الله،', 'Technical support for selected operation and maintenance and facility management projects at Bin Jarallah Group,'],
            ['tatweer-buildings-company', 'school-buildings-contracts-supervision-central-and-northern', 'الإشراف على العقود القائمة بوزارة التربية والتعليم بالمنطقة الوسطى والشمالية للمباني المدرسية.', 'Supervision of existing Ministry of Education contracts for school buildings in the Central and Northern Regions.'],
            ['tatweer-buildings-company', 'school-facility-management-supervision-framework-agreement', 'الاتفاقية الإطارية لخدمات الإشراف على مشاريع إدارة المرافق بالمنطقة الوسطى والشمالية للمباني المدرسية.', 'Framework agreement for supervising facility management projects for school buildings in the Central and Northern Regions.'],
            ['tatweer-buildings-company', 'southern-region-facility-management-supervision', 'الإشراف على إدارة المرافق (التشغيل والصيانة وصيانة التكييف والنظافة) بالمنطقة الجنوبية.', 'Supervision of facility management (operation and maintenance, air-conditioning maintenance, and cleaning) in the Southern Region.'],
            ['tatweer-buildings-company', 'western-region-education-projects-study', 'دراسة مشاريع وزارة التعليم الجاري تنفيذها للمنطقة الغربية.', 'Study of Ministry of Education projects under way in the Western Region.'],
            ['ministry-of-health', 'king-abdulaziz-hospital-site-development', 'تطوير الموقع العام لمستشفى الملك عبد العزيز.', 'Site development for King Abdulaziz Hospital.'],
            ['saudi-red-crescent-authority', 'ambulance-centers-design-and-supervision', 'دراسة وتصميم المراكز الإسعافية والإشراف على تنفيذها', 'Study, design, and construction supervision of ambulance centers'],
            ['ministry-of-justice', 'eastern-province-courts-and-notary-buildings-supervision', 'مشروع استكمال الإشراف على مشروع إنشاء مباني المحاكم وكتابات العدل بالمنطقة الشرقية', 'Completing the supervision of the construction of court and notary buildings in the Eastern Province'],
            ['ministry-of-justice', 'courts-of-appeal-design-and-supervision-phase-two', 'المرحلة الثانية من التصميم والإشراف على محاكم الاستئناف لوزارة العدل.', 'Phase two of design and supervision of the courts of appeal for the Ministry of Justice.'],
            ['ministry-of-culture', 'central-riyadh-heritage-buildings-restoration', 'ترميم مباني التراث المعماري وسط الرياض.', 'Restoration of architectural heritage buildings in central Riyadh.'],
            // Printed as two bullets on p.12; stored as one project (dispute).
            ['ministry-of-sport', 'sports-facilities-efficiency-and-development', 'تقديم الخدمات الاستشارية والفنية لرفع كفاءة وتطوير المنشآت الرياضية.', 'Consulting and technical services to improve the efficiency of and develop sports facilities.'],
            ['social-development-bank', 'social-development-bank-engineering-projects-supervision', 'تقديم الخدمات الاستشارية للإشراف على المشاريع الهندسية ببنك التنمية الاجتماعية.', 'Consulting services for supervising engineering projects at the Social Development Bank.'],
            ['ministry-of-investment', 'investment-consulting-framework-agreement', 'اتفاقية إطارية مفتوحة لتقديم خدمات استشارية (تصميم – إشراف).', 'Open framework agreement for consulting services (design – supervision).'],
        ];

        foreach ($rows as $index => [$owner, $slug, $titleAr, $titleEn]) {
            Project::create([
                'slug' => $slug,
                'client_id' => $clients[$owner]->id,
                'title' => self::t($titleAr, $titleEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }
    }

    private function regions(): void
    {
        // [slug, ISO 3166-2 code|null, Arabic name as printed, English name]
        $rows = [
            ['northern-region', null, 'المنطقة الشمالية', 'Northern Region'],
            ['tabuk', 'SA-07', 'منطقة تبوك', 'Tabuk'],
            ['al-qassim', 'SA-05', 'منطقة القصيم', 'Al-Qassim'],
            ['madinah', 'SA-03', 'منطقة المدينة المنورة', 'Madinah Region'],
            ['riyadh', 'SA-01', 'الرياض', 'Riyadh Region'],
            ['eastern-province', 'SA-04', 'المنطقة الشرقية', 'Eastern Province'],
            ['makkah', 'SA-02', 'مكة', 'Makkah Region'],
            ['al-baha', 'SA-11', 'الباحة', 'Al-Baha'],
            ['asir', 'SA-14', 'عسير', 'Asir'],
            ['jazan', 'SA-09', 'جازان', 'Jazan'],
            ['najran', 'SA-10', 'نجران', 'Najran'],
        ];

        foreach ($rows as $index => [$slug, $code, $nameAr, $nameEn]) {
            Region::create([
                'slug' => $slug,
                'code' => $code,
                'name' => self::t($nameAr, $nameEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }
    }
}

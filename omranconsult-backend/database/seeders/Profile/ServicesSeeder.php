<?php

namespace Database\Seeders\Profile;

use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;

/**
 * Services per A18 / P15: three axes (§3.14), asset-management services (§3.16),
 * and engineering disciplines (§3.17). Items are titles only in the profile.
 */
class ServicesSeeder extends ProfileSeeder
{
    public function run(): void
    {
        foreach ($this->categories() as $categoryIndex => [$slug, $titleAr, $titleEn, $services]) {
            $category = ServiceCategory::create([
                'slug' => $slug,
                'title' => self::t($titleAr, $titleEn),
                'sort_order' => $categoryIndex + 1,
                ...self::published(),
            ]);

            foreach ($services as $serviceIndex => [$serviceSlug, $serviceAr, $serviceEn]) {
                Service::create([
                    'category_id' => $category->id,
                    'slug' => $serviceSlug,
                    'title' => self::t($serviceAr, $serviceEn),
                    'sort_order' => $serviceIndex + 1,
                    ...self::published(),
                ]);
            }
        }
    }

    /**
     * @return array<int, array{0: string, 1: string, 2: string, 3: array<int, array{0: string, 1: string, 2: string}>}>
     */
    private function categories(): array
    {
        return [
            ['engineering-consulting', 'الاستشارات الهندسية', 'Engineering Consulting', [
                ['design-management', 'إدارة التصميم', 'Design Management'],
                ['building-inspection-and-site-supervision', 'فحص المباني والإشراف على مواقع البناء', 'Building Inspection and Construction Site Supervision'],
                ['health-safety-and-environment', 'الصحة والسلامة والبيئة', 'Health, Safety, and Environment'],
                ['feasibility-studies', 'دراسات الجدوى', 'Feasibility Studies'],
                ['value-engineering', 'الهندسة القيمية', 'Value Engineering'],
                ['final-costs-and-handover', 'التكاليف النهائية والتسليم', 'Final Costs and Handover'],
                ['infrastructure-planning', 'تخطيط البنية التحتية', 'Infrastructure Planning'],
                ['sustainable-engineering-solutions', 'حلول هندسية مستدامة', 'Sustainable Engineering Solutions'],
                ['quality-assurance-and-control', 'ضمان ومراقبة الجودة', 'Quality Assurance and Control'],
            ]],
            ['project-management-and-technical-support', 'إدارة المشاريع والدعم الفني', 'Project Management and Technical Support', [
                ['project-management', 'إدارة المشاريع', 'Project Management'],
                ['contract-management', 'إدارة العقود', 'Contract Management'],
                ['asset-and-facility-management', 'إدارة الأصول والمرافق', 'Asset and Facility Management'],
                ['building-management', 'إدارة المنشآت', 'Building Management'],
                ['project-development', 'تطوير المشاريع', 'Project Development'],
                ['cost-estimation-and-management', 'التقدير وإدارة التكاليف', 'Cost Estimation and Management'],
                ['construction-management', 'إدارة الإنشاءات', 'Construction Management'],
                ['planning-and-scheduling', 'التخطيط والجدولة', 'Planning and Scheduling'],
                ['stakeholder-management', 'إدارة أصحاب المصلحة', 'Stakeholder Management'],
            ]],
            ['business-consulting', 'استشارات الأعمال', 'Business Consulting', [
                ['digital-transformation', 'لتحول الرقمي', 'Digital Transformation'],
                ['strategic-consulting', 'الاستشارات الاستراتيجية', 'Strategic Consulting'],
                ['corporate-development-and-training', 'تطوير الشركات والتدريب', 'Corporate Development and Training'],
                ['sustainability-consulting', 'استشارات الاستدامة', 'Sustainability Consulting'],
                ['process-reengineering', 'إعادة هندسة العمليات', 'Process Reengineering'],
                ['operations-supply-chain-management', 'إدارة سلسلة توريد العمليات', 'Operations Supply Chain Management'],
            ]],
            ['asset-management-services', 'خدمات إدارة الأصول', 'Asset Management Services', [
                ['asset-inventory-documentation-classification-and-valuation', 'حصر وتوثيق الأصول وتصنيفها وتقييمها', 'Asset Inventory, Documentation, Classification, and Valuation'],
                ['work-order-task-and-contractor-management', 'إدارة أوامر العمل والمهام والمقاولين', 'Work Order, Task, and Contractor Management'],
                ['work-order-task-and-contractor-management-03', 'إدارة أوامر العمل والمهام والمقاولين', 'Work Order, Task, and Contractor Management'],
                ['contract-and-supplier-management-and-performance-monitoring', 'إدارة العقود والموردين ومراقبة الأداء', 'Contract and Supplier Management and Performance Monitoring'],
                ['continuous-improvement-and-performance-efficiency-improvement', 'التحسين المستمر ورفع كفاءة الأداء', 'Continuous Improvement and Performance Efficiency Improvement'],
                ['asset-and-facility-management-planning-and-strategy', 'التخطيط واستراتيجية إدارة الأصول والمرافق', 'Asset and Facility Management Planning and Strategy'],
                ['risk-compliance-and-business-continuity-management', 'إدارة المخاطر والامتثال وضمان استمرارية الأعمال', 'Risk, Compliance, and Business Continuity Management'],
                ['data-and-asset-management-and-business-continuity', 'إدارة البيانات والأصول وضمان استمرارية الأعمال', 'Data and Asset Management and Business Continuity'],
                ['energy-and-sustainability-management-and-resource-efficiency-improvement', 'إدارة الطاقة والاستدامة ورفع كفاءة الموارد', 'Energy and Sustainability Management and Resource Efficiency Improvement'],
                ['reporting-dashboards-and-decision-support', 'التقارير ولوحاتالمؤشرات ودعم اتخاذ القرار', 'Reporting, Dashboards, and Decision Support'],
            ]],
            ['engineering-and-design', 'الهندسة والتصميم', 'Engineering and Design', [
                ['facilities-engineering', 'هندسة المرافق', 'Facilities Engineering'],
                ['master-planning', 'التخطيط الرئيسي', 'Master Planning'],
                ['urban-planning', 'التخطيط الحضري', 'Urban Planning'],
                ['landscape-engineering', 'هندسة المناظر الطبيعية', 'Landscape Engineering'],
                ['civil-engineering', 'الهندسة المدنية', 'Civil Engineering'],
                ['architectural-design', 'التصميم المعماري', 'Architectural Design'],
                ['structural-engineering', 'هندسة الإنشاءات', 'Structural Engineering'],
                ['transportation-engineering-and-planning', 'هندسة وتخطيط النقل', 'Transportation Engineering and Planning'],
                ['interior-design', 'التصاميم الداخلية', 'Interior Design'],
                ['electrical-engineering', 'الهندسة الكهربائية', 'Electrical Engineering'],
                ['life-safety', 'سلامة الحياة', 'Life Safety'],
                ['mechanical-engineering', 'الهندسة الميكانيكية', 'Mechanical Engineering'],
            ]],
        ];
    }
}

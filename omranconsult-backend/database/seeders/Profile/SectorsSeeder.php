<?php

namespace Database\Seeders\Profile;

use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Sector;

/**
 * Sectors (SDD §6.7 P17, A29). The first five are the design's filter chips; the last three are
 * added because projects need them. Each project's sector is derived from its owning entity and
 * title; the mapping was approved with docs/briefs/PHASE4C_PLAN.md §4 (Q10).
 */
class SectorsSeeder extends ProfileSeeder
{
    /**
     * [slug, Arabic, English, default image key, project slugs]
     *
     * @var array<int, array{0: string, 1: string, 2: string, 3: string, 4: array<int, string>}>
     */
    private const SECTORS = [
        ['education', 'التعليم', 'Education', 'riyadh_teal', [
            'school-buildings-contracts-supervision-central-and-northern',
            'school-facility-management-supervision-framework-agreement',
            'southern-region-facility-management-supervision',
            'western-region-education-projects-study',
        ]],
        ['health', 'الصحة', 'Health', 'facade', [
            'al-hayat-national-hospitals-operation-and-maintenance-supervision',
            'king-abdulaziz-hospital-site-development',
            'ambulance-centers-design-and-supervision',
        ]],
        ['water-and-environment', 'المياه والبيئة', 'Water and Environment', 'aerial', [
            'mewa-operation-and-maintenance-efficiency-consulting',
            'dams-operation-and-maintenance-efficiency-consulting',
            'mewa-small-projects-supervision-phase-one',
            'water-conservation-solutions-mosques-and-schools-study',
            'cop16-technical-audit',
            'efficiency-and-conservation-compliance-regulation',
            'technical-standards-unification',
            'irrigation-projects-design-framework-agreement',
            'dam-projects-consulting-services',
        ]],
        ['infrastructure', 'البنية التحتية', 'Infrastructure', 'site', [
            'central-veterinary-laboratory-dhurma',
        ]],
        ['universities', 'الجامعات', 'Universities', 'control', [
            'king-faisal-university-operation-and-maintenance-efficiency',
            'king-saud-university-operation-and-maintenance-efficiency',
        ]],
        ['government-buildings', 'المباني الحكومية', 'Government Buildings', 'building', [
            'eastern-province-courts-and-notary-buildings-supervision',
            'courts-of-appeal-design-and-supervision-phase-two',
            'social-development-bank-engineering-projects-supervision',
            'investment-consulting-framework-agreement',
        ]],
        ['culture-and-sport', 'الثقافة والرياضة', 'Culture and Sport', 'truss', [
            'central-riyadh-heritage-buildings-restoration',
            'sports-facilities-efficiency-and-development',
        ]],
        ['facilities-and-real-estate', 'المرافق والعقارات', 'Facilities and Real Estate', 'tablet', [
            'bin-jarallah-facility-management-technical-support',
        ]],
    ];

    public function run(): void
    {
        foreach (self::SECTORS as $index => [$slug, $nameAr, $nameEn, $image, $projects]) {
            $sector = Sector::create([
                'slug' => $slug,
                'name' => self::t($nameAr, $nameEn),
                'default_image' => $image,
                'sort_order' => $index + 1,
                ...self::published(),
            ]);

            Project::query()->whereIn('slug', $projects)->update(['sector_id' => $sector->id]);
        }
    }

    /**
     * @return array<int, string>
     */
    public static function assignedProjectSlugs(): array
    {
        return array_merge(...array_map(fn (array $sector): array => $sector[4], self::SECTORS));
    }
}

<?php

namespace Database\Seeders\Design;

use App\Modules\Projects\Infrastructure\Models\Project;
use Database\Seeders\Profile\ProfileSeeder;

/**
 * Home featured projects and deliberate cover images (SDD §6.7 P24, PHASE4C_HOME_REVIEW H3).
 *
 * The featured picks and their images follow the Figma Home and Projects pages (image overrides
 * decoded from OMRAN.fig). Other projects get a stock image by subject so that no grid row, and no
 * pair of neighbours in the Home bento, repeats an image. None of these is a project photo (U25).
 */
class FeaturedProjectsSeeder extends ProfileSeeder
{
    /**
     * Figma Home order: the large bento card, the two stacked cards, then the row of three
     * (reading order, right to left in Arabic).
     *
     * @var array<int, string>
     */
    private const FEATURED = [
        'school-buildings-contracts-supervision-central-and-northern',
        'king-saud-university-operation-and-maintenance-efficiency',
        'dam-projects-consulting-services',
        'cop16-technical-audit',
        'king-abdulaziz-hospital-site-development',
        'central-veterinary-laboratory-dhurma',
    ];

    /**
     * Project slug => image key (public/images/site). The first nine are the Figma picks.
     *
     * @var array<string, string>
     */
    public const IMAGES = [
        'school-buildings-contracts-supervision-central-and-northern' => 'riyadh_teal',
        'king-saud-university-operation-and-maintenance-efficiency' => 'tablet',
        'dam-projects-consulting-services' => 'aerial',
        'cop16-technical-audit' => 'wave',
        'king-abdulaziz-hospital-site-development' => 'facade',
        'central-veterinary-laboratory-dhurma' => 'site',
        'king-faisal-university-operation-and-maintenance-efficiency' => 'control',
        'ambulance-centers-design-and-supervision' => 'cad',
        'al-hayat-national-hospitals-operation-and-maintenance-supervision' => 'truss',
        'mewa-operation-and-maintenance-efficiency-consulting' => 'engineer',
        'dams-operation-and-maintenance-efficiency-consulting' => 'sunset',
        'mewa-small-projects-supervision-phase-one' => 'team',
        'water-conservation-solutions-mosques-and-schools-study' => 'cad',
        'efficiency-and-conservation-compliance-regulation' => 'control',
        'technical-standards-unification' => 'handshake',
        'irrigation-projects-design-framework-agreement' => 'digital',
        'bin-jarallah-facility-management-technical-support' => 'engineer',
        'school-facility-management-supervision-framework-agreement' => 'building',
        'southern-region-facility-management-supervision' => 'sunset',
        'western-region-education-projects-study' => 'team',
        'eastern-province-courts-and-notary-buildings-supervision' => 'building',
        'courts-of-appeal-design-and-supervision-phase-two' => 'night',
        'central-riyadh-heritage-buildings-restoration' => 'aerial',
        'sports-facilities-efficiency-and-development' => 'truss',
        'social-development-bank-engineering-projects-supervision' => 'handshake',
        'investment-consulting-framework-agreement' => 'digital',
    ];

    public function run(): void
    {
        foreach (self::IMAGES as $slug => $image) {
            Project::query()->where('slug', $slug)->update(['gallery' => json_encode([$image])]);
        }

        foreach (self::FEATURED as $index => $slug) {
            Project::query()->where('slug', $slug)->update(['is_featured' => true, 'featured_order' => $index + 1]);
        }

        self::dispute(Project::class, 'gallery', 'design_copy_review',
            'Project images are stock photos from the Figma design set, not photos of the projects: the design\'s picks for the nine projects it shows, and images chosen by subject for the rest. Replace them with original project photos (U25). The six featured projects follow the Figma Home page.',
            ['source' => 'OMRAN.fig image overrides (Home, Projects)', 'related_issue' => 'U25']);
    }
}

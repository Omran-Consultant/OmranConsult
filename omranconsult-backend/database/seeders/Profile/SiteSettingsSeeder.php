<?php

namespace Database\Seeders\Profile;

use App\Modules\Content\Infrastructure\Models\SiteSetting;

/**
 * Company name and contact details from the profile (p.1, p.45; A22), plus the Phase 4C
 * working hours and downloadable profile (P23).
 */
class SiteSettingsSeeder extends ProfileSeeder
{
    public function run(): void
    {
        SiteSetting::create([
            'key' => 'company_legal_name',
            'value' => self::t('شركة العمران المتقدم للاستشارات الهندسية', 'OMRAN Advanced Company for Engineering Consultancy'),
        ]);

        SiteSetting::create([
            'key' => 'contact',
            'value' => [
                'address' => self::t(
                    'الرياض، المملكة العربية السعودية -حي الربيع- طريق الملك عبدالعزيز',
                    'King Abdulaziz Road, Al Rabi District, Riyadh, Saudi Arabia',
                ),
                'postal' => self::t('رقم بريدي 241514 الرياض 11322', 'Postal number 241514, Riyadh 11322'),
                'phones' => ['+966543264982', '+966114999925'],
                'email' => 'info@omranconsult.com',
            ],
        ]);

        // Phase 4C (P23): working hours come from the design, not the profile (U22).
        $hours = SiteSetting::create([
            'key' => 'working_hours',
            'value' => self::t('الأحد – الخميس · 8:00 ص – 5:00 م', 'Sunday – Thursday · 8:00 AM – 5:00 PM'),
        ]);
        self::dispute($hours, 'value', 'design_copy_review',
            'Working hours are demo text from the Figma contact page; the profile does not state them. Confirm the hours (U22).',
            ['source' => 'Figma design (docs/design-reference, 2026-11-07)', 'related_issue' => 'U22']);

        // Manual copy of the profile in git-ignored public storage until the Phase 5 media library.
        SiteSetting::create([
            'key' => SiteSetting::PROFILE_PDF_KEY,
            'value' => ['path' => 'files/omran-profile-2029.pdf'],
        ]);
    }
}

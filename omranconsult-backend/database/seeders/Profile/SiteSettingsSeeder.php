<?php

namespace Database\Seeders\Profile;

use App\Modules\Content\Infrastructure\Models\SiteSetting;

/**
 * Company name and contact details from the profile (p.1, p.45; A22).
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
    }
}

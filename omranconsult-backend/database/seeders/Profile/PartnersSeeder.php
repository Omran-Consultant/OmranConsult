<?php

namespace Database\Seeders\Profile;

use App\Modules\Partners\Infrastructure\Models\Partner;

/**
 * Partners (§3.20). Names are the Latin logo text in both locales.
 */
class PartnersSeeder extends ProfileSeeder
{
    public function run(): void
    {
        $partners = [
            ['OLIVER WYMAN — A MARSH BUSINESS', 'خدمات دعم استراتيجي', 'Strategic support services'],
            ['MUSANADAH', 'في مجال إدارة الحشود', 'Crowd management'],
            ['TACENT', 'في مجال إدارة المرافق', 'Facility management'],
            ['BUREAU VERITAS', 'في مجال الجودة والامتثال وإدارة المخاطر', 'Quality, compliance, and risk management'],
        ];

        foreach ($partners as $index => [$name, $fieldAr, $fieldEn]) {
            Partner::create([
                'name' => self::t($name, $name),
                'field' => self::t($fieldAr, $fieldEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }
    }
}

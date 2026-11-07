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
            ['oliver-wyman', 'OLIVER WYMAN — A MARSH BUSINESS', 'خدمات دعم استراتيجي', 'Strategic support services'],
            ['musanadah', 'MUSANADAH', 'في مجال إدارة الحشود', 'Crowd management'],
            ['tacent', 'TACENT', 'في مجال إدارة المرافق', 'Facility management'],
            ['bureau-veritas', 'BUREAU VERITAS', 'في مجال الجودة والامتثال وإدارة المخاطر', 'Quality, compliance, and risk management'],
        ];

        foreach ($partners as $index => [$slug, $name, $fieldAr, $fieldEn]) {
            Partner::create([
                'slug' => $slug,
                'name' => self::t($name, $name),
                'field' => self::t($fieldAr, $fieldEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }
    }
}

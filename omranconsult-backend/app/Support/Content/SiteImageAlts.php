<?php

namespace App\Support\Content;

/**
 * Alt text for the Figma site photos projects already reference by key.
 * Strings match features/media/profile-images.ts so a linked media row keeps the same alt.
 */
final class SiteImageAlts
{
    /**
     * @var array<string, array{ar: string, en: string}>
     */
    private const ALTS = [
        'aerial' => [
            'ar' => 'منظر جوي لأبراج حي الملك عبدالله المالي في الرياض',
            'en' => 'Aerial view of the King Abdullah Financial District towers in Riyadh',
        ],
        'building' => [
            'ar' => 'واجهة مبنى حديث بألواح زجاجية عمودية',
            'en' => 'Modern building facade with vertical glass fins',
        ],
        'cad' => [
            'ar' => 'مهندس يراجع نموذجاً ثلاثي الأبعاد لمبنى على الشاشة',
            'en' => 'Engineer reviewing a 3D building model on screen',
        ],
        'control' => [
            'ar' => 'مهندسة تعمل على مخططات هندسية في مكتب حديث',
            'en' => 'Engineer working on technical drawings in a modern office',
        ],
        'digital' => [
            'ar' => 'شخص يعمل على حاسوب محمول أمام واجهة بيانات رقمية',
            'en' => 'Person working on a laptop in front of a digital data display',
        ],
        'engineer' => [
            'ar' => 'مهندس بخوذة السلامة يحمل جهازاً لوحياً أمام أفق الرياض',
            'en' => 'Engineer in a hard hat holding a tablet against the Riyadh skyline',
        ],
        'facade' => [
            'ar' => 'واجهة زجاجية زرقاء لمبنى حديث',
            'en' => 'Blue glass facade of a modern building',
        ],
        'handshake' => [
            'ar' => 'مصافحة شراكة فوق مشهد صناعي',
            'en' => 'Partnership handshake over an industrial scene',
        ],
        'night' => [
            'ar' => 'أفق الرياض ليلاً مع تقاطعات الطرق المضيئة',
            'en' => 'Riyadh skyline at night with lit highway interchanges',
        ],
        'riyadh_teal' => [
            'ar' => 'أفق الرياض وبرج المملكة عند الغسق',
            'en' => 'Riyadh skyline and Kingdom Centre at dusk',
        ],
        'site' => [
            'ar' => 'مهندس موقع بخوذة صفراء أمام منشأة صناعية',
            'en' => 'Site engineer in a yellow hard hat facing an industrial plant',
        ],
        'sunset' => [
            'ar' => 'أبراج الرياض وخط المترو عند الغروب',
            'en' => 'Riyadh towers and the metro line at sunset',
        ],
        'tablet' => [
            'ar' => 'مهندس يتابع لوحة تحكم رقمية على جهاز لوحي في منشأة تشغيلية',
            'en' => 'Engineer monitoring a digital control panel on a tablet in a plant',
        ],
        'team' => [
            'ar' => 'فريق عمل حول طاولة اجتماعات بأجهزة محمولة',
            'en' => 'Team around a meeting table with laptops',
        ],
        'truss' => [
            'ar' => 'هيكل إنشائي معدني دائري من الأعلى',
            'en' => 'Circular steel structure seen from above',
        ],
        'wave' => [
            'ar' => 'مبنى بسقف موجي وأبراج حديثة عند الغروب',
            'en' => 'Building with a wave-shaped roof and modern towers at sunset',
        ],
    ];

    /**
     * @return array{ar: string, en: string}|null
     */
    public static function for(string $key): ?array
    {
        return self::ALTS[$key] ?? null;
    }
}

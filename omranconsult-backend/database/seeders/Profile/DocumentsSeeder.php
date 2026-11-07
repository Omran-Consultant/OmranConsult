<?php

namespace Database\Seeders\Profile;

use App\Modules\Documents\Domain\DocumentKind;
use App\Modules\Documents\Infrastructure\Models\Document;

/**
 * Licenses (§3.9) and ISO certificates (§3.10). Validity dates are the printed ones.
 * Expired certificates stay published (A26); their state is recorded as disputes.
 * standard_code is read from the certificate scan; printed card labels that differ are disputes.
 */
class DocumentsSeeder extends ProfileSeeder
{
    public function run(): void
    {
        $licenses = [
            ['شهادة التصنيف (الدرجة الأولى)', 'Classification Certificate (First Grade)'],
            ['السجل التجاري', 'Commercial Registration'],
            ['ترخيص مزاولة المهنة', 'Professional Practice License'],
            ['رخصة نشاط تجاري', 'Commercial Activity License'],
            ['ترخيص الدفاع المدني', 'Civil Defense License'],
        ];

        $order = 1;
        foreach ($licenses as [$titleAr, $titleEn]) {
            Document::create([
                'kind' => DocumentKind::License,
                'title' => self::t($titleAr, $titleEn),
                'sort_order' => $order++,
                ...self::published(),
            ]);
        }

        // [Arabic label, English label, standard, issuer as printed, valid_from, valid_until]
        $certificates = [
            ['إدارة الصحة والسلامة', 'Health and Safety Management', 'ISO 45001:2018', 'Quality Registrar Systems', null, '2026-06-02'],
            ['إدارة البيئة', 'Environmental Management', 'ISO 14001:2015', 'Quality Registrar Systems', null, '2026-06-02'],
            ['إدارة أمن المعلومات', 'Information Security Management', 'ISO/IEC 27001:2022', 'Frenchcert', null, '2026-07-21'],
            ['إدارة الجودة', 'Quality Management', 'ISO 9001:2015', 'Frenchcert', null, '2026-07-16'],
            ['إدارة المشاريع', 'Project Management', 'ISO 21500:2012', 'ARS', null, '2027-04-16'],
            ['إدارة الأصول والمرافق', 'Asset and Facility Management', 'ISO 41001:2018', 'ABC Certification', '2025-01-12', '2026-01-11'],
            ['إدارة المسؤولية المجتمعية', 'Social Responsibility Management', 'ISO 26000:2010', 'European Accreditation Council', '2026-04-07', '2029-04-06'],
            ['إدارة المخاطر', 'Risk Management', 'ISO 31000:2018', 'European Accreditation Council', '2026-04-07', '2029-04-06'],
        ];

        foreach ($certificates as [$titleAr, $titleEn, $standard, $issuer, $validFrom, $validUntil]) {
            Document::create([
                'kind' => DocumentKind::IsoCertificate,
                'title' => self::t($titleAr, $titleEn),
                'standard_code' => $standard,
                'issuer' => $issuer,
                'valid_from' => $validFrom,
                'valid_until' => $validUntil,
                'sort_order' => $order++,
                ...self::published(),
            ]);
        }
    }
}

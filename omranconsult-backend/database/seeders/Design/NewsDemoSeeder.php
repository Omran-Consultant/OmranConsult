<?php

namespace Database\Seeders\Design;

use App\Modules\News\Infrastructure\Models\NewsCategory;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileSeeder;
use Illuminate\Support\Carbon;

/**
 * Demo news from the Figma Media Center and News Article frames (SDD §6.7 P21, A29, PHASE4C D3).
 * Arabic is the design text; English is Claude's translation (A25 exception). Only the featured
 * post has a full body in the design; the others carry the card summary only (Q9: no invented text).
 * Every post is `is_demo` and must be replaced or unpublished before launch.
 */
class NewsDemoSeeder extends ProfileSeeder
{
    /**
     * [slug, Arabic, English] in the design's tab order.
     */
    private const CATEGORIES = [
        ['company-news', 'أخبار الشركة', 'Company news'],
        ['projects', 'المشاريع', 'Projects'],
        ['events', 'الفعاليات', 'Events'],
        ['articles', 'مقالات', 'Articles'],
    ];

    public function run(): void
    {
        $categories = [];
        foreach (self::CATEGORIES as $index => [$slug, $nameAr, $nameEn]) {
            $categories[$slug] = NewsCategory::create([
                'slug' => $slug,
                'name' => self::t($nameAr, $nameEn),
                'sort_order' => $index + 1,
                ...self::published(),
            ]);
        }

        foreach ($this->posts() as $index => $post) {
            NewsPost::create([
                'slug' => $post['slug'],
                'news_category_id' => $categories[$post['category']]->id,
                'title' => $post['title'],
                'excerpt' => $post['excerpt'],
                'body' => $post['body'] ?? null,
                'cover_image' => $post['cover'],
                'author' => $post['author'] ?? null,
                'tags' => $post['tags'] ?? null,
                'is_featured' => $post['featured'] ?? false,
                'is_demo' => true,
                'sort_order' => $index + 1,
                'status' => PublicationStatus::Published->value,
                'published_at' => Carbon::parse($post['date']),
            ]);
        }

        self::dispute(NewsPost::class, null, 'demo_content',
            'All news posts are demo content copied from the Figma design (Media Center and News Article frames), with English translated by Claude. Replace or unpublish them before launch (PHASE4C D3). Dates are demo: the design shows «ديسمبر 2024» and «2026» only. Posts other than the COP16 article have no body in the design and show their summary only.',
            ['source' => 'figma-structure.txt: Media Center — Desktop 1440, News Article — Desktop 1440', 'is_demo' => true]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function posts(): array
    {
        return [
            [
                'slug' => 'omran-cop16-technical-audit',
                'category' => 'projects',
                'date' => '2024-12-01',
                'featured' => true,
                'cover' => 'wave',
                'title' => self::t(
                    'عمران تشارك في التدقيق الفني لمشروع مؤتمر الأطراف لمكافحة التصحر COP16',
                    'OMRAN takes part in the technical audit of the COP16 Conference of the Parties to Combat Desertification',
                ),
                'excerpt' => self::t(
                    'قدّم فريق عمران خدمات التدقيق الفني على تنفيذ مشروع مؤتمر الأطراف COP16 في الرياض، ضمن جهود دعم استضافة المملكة لأحد أكبر المؤتمرات البيئية الدولية.',
                    'The OMRAN team provided technical audit services for the delivery of the COP16 Conference of the Parties in Riyadh, supporting the Kingdom as host of one of the largest international environmental conferences.',
                ),
                'author' => self::t('فريق الاتصال المؤسسي', 'Corporate Communications Team'),
                'tags' => ['ar' => ['COP16', 'التدقيق الفني', 'البيئة', 'الرياض'], 'en' => ['COP16', 'Technical audit', 'Environment', 'Riyadh']],
                'body' => [
                    'ar' => [
                        ['type' => 'paragraph', 'text' => 'قدّم فريق شركة العمران المتقدم للاستشارات الهندسية خدمات التدقيق الفني على تنفيذ مشروع مؤتمر الأطراف لاتفاقية الأمم المتحدة لمكافحة التصحر COP16 الذي استضافته الرياض.'],
                        ['type' => 'paragraph', 'text' => 'وشملت أعمال التدقيق مراجعة مطابقة الأعمال المنفذة للمواصفات الفنية والمخططات المعتمدة، ومتابعة معايير الجودة والصحة والسلامة في مواقع العمل، ورفع تقارير دورية للجهة المالكة تدعم اتخاذ القرار في الوقت المناسب.'],
                        ['type' => 'heading', 'text' => 'نطاق العمل'],
                        ['type' => 'paragraph', 'text' => 'اعتمد الفريق منهجية متعددة المراحل بدأت بدراسة الوضع الراهن، مروراً بخطط التفتيش الميداني والتوثيق باستخدام طائرات الدرون وأجهزة الرفع المساحي، وصولاً إلى تقارير الأداء والتوصيات.'],
                        ['type' => 'quote', 'text' => '«نؤمن بأن جودة التنفيذ تبدأ من دقة التدقيق، ولهذا نوظف أحدث الأدوات الرقمية لضمان مطابقة كل تفصيلة للمعايير».'],
                        ['type' => 'image', 'image' => 'control'],
                        ['type' => 'image', 'image' => 'night'],
                        ['type' => 'paragraph', 'text' => 'ويأتي هذا المشروع امتداداً لسجل عمران في دعم الجهات الحكومية، ومنها وزارة البيئة والمياه والزراعة، في رفع كفاءة المشاريع وتحقيق مستهدفات رؤية المملكة 2030.'],
                    ],
                    'en' => [
                        ['type' => 'paragraph', 'text' => 'The team of OMRAN Advanced Company for Engineering Consultancy provided technical audit services for the delivery of COP16, the Conference of the Parties to the United Nations Convention to Combat Desertification, hosted in Riyadh.'],
                        ['type' => 'paragraph', 'text' => 'The audit covered checking that completed works matched the technical specifications and approved drawings, following quality, health and safety standards on site, and sending regular reports to the owner to support timely decisions.'],
                        ['type' => 'heading', 'text' => 'Scope of work'],
                        ['type' => 'paragraph', 'text' => 'The team followed a multi-phase method: a study of the current situation, then field inspection plans and documentation with drones and survey instruments, and finally performance reports and recommendations.'],
                        ['type' => 'quote', 'text' => '“We believe that quality delivery starts with a precise audit, which is why we use the latest digital tools to make sure every detail meets the standards.”'],
                        ['type' => 'image', 'image' => 'control'],
                        ['type' => 'image', 'image' => 'night'],
                        ['type' => 'paragraph', 'text' => 'The project extends OMRAN\'s record of supporting government entities, including the Ministry of Environment, Water and Agriculture, in raising project efficiency and achieving the targets of Saudi Vision 2030.'],
                    ],
                ],
            ],
            [
                'slug' => 'osool-360-platform-launch',
                'category' => 'company-news',
                'date' => '2026-10-01',
                'cover' => 'digital',
                'title' => self::t('إطلاق منصة OSOOL 360 لإدارة الأصول والمرافق', 'Launch of the OSOOL 360 asset and facility management platform'),
                'excerpt' => self::t('منصة رقمية تجمع بيانات الأصول وأوامر العمل ومؤشرات الأداء لدعم القرار.', 'A digital platform that brings together asset data, work orders and performance indicators to support decisions.'),
            ],
            [
                'slug' => 'school-facilities-supervision-framework-agreement',
                'category' => 'projects',
                'date' => '2026-09-01',
                'cover' => 'riyadh_teal',
                'title' => self::t('اتفاقية إطارية للإشراف على إدارة مرافق المباني المدرسية', 'Framework agreement to supervise facility management of school buildings'),
                'excerpt' => self::t('خدمات الإشراف على مشاريع إدارة المرافق بالمنطقة الوسطى والشمالية.', 'Supervision services for facility management projects in the Central and Northern regions.'),
            ],
            [
                'slug' => 'king-saud-university-operations-efficiency',
                'category' => 'projects',
                'date' => '2026-08-01',
                'cover' => 'control',
                'title' => self::t('رفع كفاءة التشغيل والصيانة في جامعة الملك سعود', 'Improving operation and maintenance efficiency at King Saud University'),
                'excerpt' => self::t('خدمات استشارية لتطوير نموذج تشغيلي موحّد ومؤشرات أداء.', 'Consulting services to develop a unified operating model and performance indicators.'),
            ],
            [
                'slug' => 'partnerships-with-international-firms',
                'category' => 'company-news',
                'date' => '2026-07-01',
                'cover' => 'handshake',
                'title' => self::t('شراكات نوعية مع بيوت خبرة عالمية', 'Distinguished partnerships with international firms'),
                'excerpt' => self::t('تعاون مع جهات دولية لتعزيز جودة الخدمات الاستشارية.', 'Cooperation with international entities to raise the quality of consulting services.'),
            ],
            [
                'slug' => 'national-asset-management-guide-education',
                'category' => 'articles',
                'date' => '2026-06-01',
                'cover' => 'team',
                'title' => self::t('كيف يرفع الدليل الوطني لإدارة الأصول كفاءة المنشآت التعليمية؟', 'How does the national asset management manual raise the efficiency of educational facilities?'),
                'excerpt' => self::t('قراءة في أفضل الممارسات لإطالة العمر الافتراضي للأصول.', 'A look at the best practices for extending the useful life of assets.'),
            ],
            [
                'slug' => 'central-veterinary-laboratory-site-visit',
                'category' => 'events',
                'date' => '2026-05-01',
                'cover' => 'site',
                'title' => self::t('فريق عمران في زيارة ميدانية لمشروع المختبر البيطري المركزي', 'OMRAN team on a site visit to the Central Veterinary Laboratory project'),
                'excerpt' => self::t('متابعة أعمال التصميم والإشراف في ضرما.', 'Following up on the design and supervision works in Dhurma.'),
            ],
            [
                'slug' => 'dam-projects-jazan-asir-najran',
                'category' => 'projects',
                'date' => '2025-06-01',
                'cover' => 'sunset',
                'title' => self::t('مشاريع السدود في جازان وعسير ونجران', 'Dam projects in Jazan, Asir and Najran'),
                'excerpt' => null,
            ],
        ];
    }
}

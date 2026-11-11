<?php

namespace App\Console\Commands;

use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Modules\Projects\Domain\DeliveryStatus;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\ContentBlocks;
use Database\Seeders\Profile\ProfileContentSeeder;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class E2ePrepareDatabaseCommand extends Command
{
    protected $signature = 'e2e:prepare-database';

    protected $description = 'Create, migrate, and seed the isolated Playwright database (local and testing only).';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->components->error('e2e:prepare-database is only available when APP_ENV is local or testing.');

            return self::FAILURE;
        }

        $connection = (string) config('database.default');
        $driver = (string) config("database.connections.{$connection}.driver");
        if ($driver !== 'mysql') {
            $this->components->error('e2e:prepare-database requires the default MySQL connection.');

            return self::FAILURE;
        }

        $e2eDatabase = (string) config('e2e.database');
        $host = (string) config("database.connections.{$connection}.host");
        $port = (string) config("database.connections.{$connection}.port");
        $username = (string) config("database.connections.{$connection}.username");
        $password = (string) config("database.connections.{$connection}.password");
        $charset = (string) config("database.connections.{$connection}.charset", 'utf8mb4');
        $collation = (string) config("database.connections.{$connection}.collation", 'utf8mb4_unicode_ci');

        $pdo = new \PDO(
            "mysql:host={$host};port={$port}",
            $username,
            $password,
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION],
        );
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$e2eDatabase}` CHARACTER SET {$charset} COLLATE {$collation}");

        Config::set("database.connections.{$connection}.database", $e2eDatabase);
        DB::purge($connection);

        $this->components->info("Prepared database {$e2eDatabase}");

        Artisan::call('migrate:fresh', ['--force' => true]);
        $this->output->write(Artisan::output());

        // Without the demo project seeder: the layout tests rely on projects with no optional facts.
        $this->call(SuperAdminRoleSeeder::class);
        $this->call(ProfileContentSeeder::class);
        $this->enrichProjectDetailFixtures();
        $this->robustnessFixtures();
        Artisan::call('media:import-site-images');
        $this->output->write(Artisan::output());

        return self::SUCCESS;
    }

    /**
     * Seeded profile projects have no optional facts, so the E2E database alone gets one full and
     * one single-gallery project for the project detail layout tests. Never run on real content.
     */
    private function enrichProjectDetailFixtures(): void
    {
        $paragraph = fn (string $text): array => ['type' => 'paragraph', 'children' => [['text' => $text]]];
        $overview = fn (string $intro, string $heading, array $items, string $quote): array => [
            $paragraph($intro),
            ['type' => 'heading', 'level' => 'h3', 'children' => [['text' => $heading]]],
            ['type' => 'list', 'style' => 'bullet', 'items' => array_map(fn (string $item): array => [['text' => $item]], $items)],
            ['type' => 'quote', 'children' => [['text' => $quote]]],
        ];

        Project::query()->where('slug', 'courts-of-appeal-design-and-supervision-phase-two')->firstOrFail()->update([
            'location' => ['ar' => 'الرياض', 'en' => 'Riyadh'],
            'service_type' => ['ar' => 'خدمات استشارية', 'en' => 'Consulting services'],
            'delivery_status' => DeliveryStatus::Completed,
            'overview' => [
                'ar' => $overview('نص تجريبي لنظرة عامة على المشروع في بيئة الاختبار.', 'أهداف المشروع', ['الهدف الأول', 'الهدف الثاني'], 'اقتباس تجريبي'),
                'en' => $overview('Sample project overview text for the test environment.', 'Project goals', ['First goal', 'Second goal'], 'Sample quote'),
            ],
            'scope' => [
                'ar' => ['حصر وتوثيق الأصول', 'تطوير خطط الصيانة', 'تطبيق نظام CAFM', 'تأهيل الكوادر'],
                'en' => ['Asset inventory', 'Maintenance plans', 'CAFM rollout', 'Staff training'],
            ],
            'gallery' => ['night', 'control', 'team', 'cad'],
        ]);

        Project::query()->where('slug', 'sports-facilities-efficiency-and-development')->firstOrFail()->update([
            'gallery' => ['truss', 'control'],
        ]);

        Project::query()->where('slug', 'western-region-education-projects-study')->firstOrFail()
            ->forceFill(['has_demo_content' => true])->save();
    }

    /**
     * SITE_POLISH P3: editor-shaped extremes on existing rows, so list counts stay as the other
     * tests expect. Long titles are exactly 120 characters; "no image" means no gallery or cover.
     */
    private function robustnessFixtures(): void
    {
        $long = fn (string $text): string => mb_substr(str_repeat($text.' ', 4), 0, 120);
        $longAr = $long('مشروع تجريبي بعنوان طويل جداً لاختبار التفاف النص في البطاقات والصفحات دون كسر الشبكة أو ظهور تمرير أفقي');
        $longEn = $long('A deliberately long project title to test text wrapping in cards and pages without breaking the grid');
        $text = fn (string $value, array $marks = []): array => ['text' => $value, ...$marks];
        $blocks = fn (string $locale): array => [
            ['type' => 'paragraph', 'children' => [
                $text($locale === 'ar' ? 'فقرة تحتوي ' : 'A paragraph with '),
                $text($locale === 'ar' ? 'نصاً عريضاً' : 'bold text', ['bold' => true]),
                $text($locale === 'ar' ? ' و' : ', '),
                $text($locale === 'ar' ? 'نصاً مائلاً' : 'italic text', ['italic' => true]),
                $text($locale === 'ar' ? ' ورابطاً ' : ' and a link '),
                $text('omranconsult.com', ['href' => 'https://omranconsult.com']),
                $text(' https://omranconsult.com/an/unbroken/path/that/is/much/longer/than/a/phone/screen/is/wide/'),
            ]],
            ['type' => 'heading', 'level' => 'h2', 'children' => [$text($locale === 'ar' ? 'عنوان من المستوى الثاني' : 'Second level heading')]],
            ['type' => 'paragraph', 'children' => [$text(str_repeat($locale === 'ar' ? 'نص طويل لاختبار الأسطر المتعددة. ' : 'Long text to test many lines. ', 30))]],
            ['type' => 'heading', 'level' => 'h3', 'children' => [$text($locale === 'ar' ? 'عنوان من المستوى الثالث' : 'Third level heading')]],
            ['type' => 'list', 'style' => 'bullet', 'items' => [[$text($locale === 'ar' ? 'بند نقطي أول' : 'First bullet')], [$text($longAr)], [$text($longEn)]]],
            ['type' => 'list', 'style' => 'number', 'items' => [[$text($locale === 'ar' ? 'بند مرقّم أول' : 'First numbered')], [$text($locale === 'ar' ? 'بند مرقّم ثانٍ' : 'Second numbered')]]],
            ['type' => 'quote', 'children' => [$text($locale === 'ar' ? 'اقتباس للاختبار' : 'A test quote')]],
        ];

        Project::query()->where('slug', 'king-abdulaziz-hospital-site-development')->firstOrFail()->update([
            'title' => ['ar' => $longAr, 'en' => $longEn],
            'overview' => ContentBlocks::validateLocaleMap(['ar' => $blocks('ar'), 'en' => $blocks('en')], 'overview'),
            'gallery' => [],
        ]);
        Project::query()->where('slug', 'investment-consulting-framework-agreement')->firstOrFail()->update([
            'title' => ['ar' => 'مركز', 'en' => 'Hub'],
        ]);

        $newsBlocks = fn (string $locale): array => [
            ...$blocks($locale),
            ['type' => 'image', 'key' => 'aerial', 'alt' => ['ar' => 'صورة داخل الخبر', 'en' => 'Image inside the article']],
        ];
        NewsPost::query()->where('slug', 'partnerships-with-international-firms')->firstOrFail()->update([
            'title' => ['ar' => $longAr, 'en' => $longEn],
            'body' => ContentBlocks::validateLocaleMap(['ar' => $newsBlocks('ar'), 'en' => $newsBlocks('en')], 'body', true),
            'cover_image' => null,
            'cover_media_id' => null,
        ]);
        NewsPost::query()->where('slug', 'national-asset-management-guide-education')->firstOrFail()->update([
            'title' => ['ar' => 'دليل', 'en' => 'Guide'],
        ]);
    }
}

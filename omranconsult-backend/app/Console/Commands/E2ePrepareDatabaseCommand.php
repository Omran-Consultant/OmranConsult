<?php

namespace App\Console\Commands;

use App\Modules\Projects\Domain\DeliveryStatus;
use App\Modules\Projects\Infrastructure\Models\Project;
use Database\Seeders\DatabaseSeeder;
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

        $this->call(DatabaseSeeder::class);
        $this->enrichProjectDetailFixtures();
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
    }
}

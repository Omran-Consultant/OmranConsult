<?php

namespace App\Console\Commands;

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

        Artisan::call('migrate', ['--force' => true]);
        $this->output->write(Artisan::output());

        $this->call(DatabaseSeeder::class);

        return self::SUCCESS;
    }
}

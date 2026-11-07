<?php

namespace Database\Seeders\Profile;

use App\Modules\Content\Infrastructure\Models\SiteSetting;
use Database\Seeders\Design\NewsDemoSeeder;
use Illuminate\Database\Seeder;

/**
 * Corporate Profile 2029 demo content, published, Arabic as printed plus unreviewed English (A25).
 * Import order per SDD §6.6, then the Phase 4C design demo content (A29).
 * Runs once: skips when content already exists.
 */
class ProfileContentSeeder extends Seeder
{
    public function run(): void
    {
        if (SiteSetting::query()->exists()) {
            $this->command?->warn('Profile content already seeded; skipping.');

            return;
        }

        $this->call([
            SiteSettingsSeeder::class,
            HomeContentSeeder::class,
            ServicesSeeder::class,
            ProjectsSeeder::class,
            SectorsSeeder::class,
            TeamSeeder::class,
            DocumentsSeeder::class,
            PartnersSeeder::class,
            ContentDisputesSeeder::class,
            NewsDemoSeeder::class,
        ]);
    }
}

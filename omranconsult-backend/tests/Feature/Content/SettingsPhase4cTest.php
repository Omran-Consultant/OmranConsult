<?php

namespace Tests\Feature\Content;

use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Content\Infrastructure\Models\SiteSetting;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Working hours and the downloadable profile (SDD §6.7 P23).
 */
class SettingsPhase4cTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->seed(ProfileContentSeeder::class);
    }

    public function test_working_hours_in_both_locales(): void
    {
        $this->getJson('/api/settings', ['Accept-Language' => 'ar'])
            ->assertOk()
            ->assertJsonPath('data.working_hours', 'الأحد – الخميس · 8:00 ص – 5:00 م');
        $this->getJson('/api/settings', ['Accept-Language' => 'en'])
            ->assertJsonPath('data.working_hours', 'Sunday – Thursday · 8:00 AM – 5:00 PM');

        $setting = SiteSetting::query()->where('key', 'working_hours')->firstOrFail();
        $this->assertTrue(ContentDispute::query()->where('subject_type', $setting->getMorphClass())->where('subject_id', $setting->id)->exists());
    }

    public function test_profile_pdf_url_is_null_when_the_file_is_missing(): void
    {
        $this->getJson('/api/settings')->assertOk()->assertJsonPath('data.profile_pdf_url', null);
    }

    public function test_profile_pdf_url_comes_from_the_storage_api(): void
    {
        Storage::disk('public')->put('files/omran-profile-2029.pdf', '%PDF-1.4');

        $url = $this->getJson('/api/settings')->json('data.profile_pdf_url');

        $this->assertSame(Storage::disk('public')->url('files/omran-profile-2029.pdf'), $url);
    }

    public function test_the_storage_path_is_not_exposed(): void
    {
        $this->assertArrayNotHasKey('profile_pdf', $this->getJson('/api/settings')->json('data'));
    }
}

<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Media\Infrastructure\Models\MediaReference;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SuperAdminRoleSeeder::class);
        Storage::fake('public');
    }

    public function test_upload_rejects_svg_and_spoofed_mime(): void
    {
        $admin = $this->admin();

        $svg = UploadedFile::fake()->create('icon.svg', 20, 'image/svg+xml');
        $this->actingAs($admin)->post('/api/admin/media', ['file' => $svg], [
            'Accept' => 'application/json',
        ])->assertUnprocessable();

        $spoof = UploadedFile::fake()->create('photo.jpg', 20, 'image/jpeg');
        $this->actingAs($admin)->post('/api/admin/media', ['file' => $spoof], [
            'Accept' => 'application/json',
        ])->assertUnprocessable();
    }

    public function test_upload_accepts_jpeg_and_delete_blocked_when_referenced(): void
    {
        $admin = $this->admin();
        $file = UploadedFile::fake()->image('cover.jpg', 80, 60);

        $response = $this->actingAs($admin)->post('/api/admin/media', ['file' => $file], [
            'Accept' => 'application/json',
        ]);
        $response->assertCreated();
        $id = $response->json('data.id');

        MediaReference::query()->create([
            'media_id' => $id,
            'referencer_type' => 'project',
            'referencer_id' => 1,
            'field' => 'cover',
        ]);

        $this->actingAs($admin)->deleteJson('/api/admin/media/'.$id)
            ->assertUnprocessable();

        $editor = User::factory()->create();
        $editor->assignRole(EditorRole::NAME);
        $this->actingAs($editor)->deleteJson('/api/admin/media/'.$id.'/force', [
            'confirmation' => 'DELETE',
        ])->assertForbidden();
    }

    public function test_import_site_images_is_idempotent(): void
    {
        $dir = sys_get_temp_dir().'/oc-media-import-'.uniqid();
        mkdir($dir.'/nested', 0755, true);
        $png = imagecreatetruecolor(4, 4);
        imagepng($png, $dir.'/nested/a.png');
        imagedestroy($png);

        $this->artisan('media:import-site-images', ['--path' => $dir])->assertSuccessful();
        $this->artisan('media:import-site-images', ['--path' => $dir])->assertSuccessful();

        $this->assertSame(1, Media::query()->count());
        $this->assertSame('site', Media::query()->first()->disk);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

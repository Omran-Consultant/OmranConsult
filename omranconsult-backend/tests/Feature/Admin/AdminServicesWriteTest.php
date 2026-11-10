<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Modules\Content\Infrastructure\Models\ContentBlock;
use App\Modules\Services\Domain\ServiceCategoryKind;
use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use App\Support\Content\PublicationStatus;
use App\Support\DashboardPermission;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\DashboardRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminServicesWriteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DashboardRolesSeeder::class);
    }

    public function test_guest_cannot_list_services(): void
    {
        $this->getJson('/api/admin/services')->assertUnauthorized();
    }

    public function test_admin_can_list_service_categories_with_items(): void
    {
        $admin = $this->admin();
        $category = ServiceCategory::query()->create([
            'slug' => 'list-axis',
            'kind' => ServiceCategoryKind::Axis,
            'title' => ['ar' => 'محور', 'en' => 'Axis'],
            'icon' => 'layers',
            'status' => PublicationStatus::Published,
            'published_at' => now(),
            'sort_order' => 1,
        ]);
        Service::query()->create([
            'category_id' => $category->id,
            'slug' => 'list-item',
            'title' => ['ar' => 'خدمة', 'en' => 'Service'],
            'status' => PublicationStatus::Published,
            'published_at' => now(),
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)->getJson('/api/admin/services')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'list-axis')
            ->assertJsonPath('data.0.services.0.slug', 'list-item');
    }

    public function test_editor_without_create_cannot_store_category(): void
    {
        Role::findByName(EditorRole::NAME, EditorRole::GUARD)->revokePermissionTo(DashboardPermission::SERVICES_CREATE);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $editor = User::factory()->create();
        $editor->assignRole(EditorRole::NAME);

        $this->actingAs($editor)->postJson('/api/admin/services/categories', [
            'title' => ['ar' => 'محور', 'en' => 'Axis'],
        ])->assertForbidden();
    }

    public function test_admin_can_create_edit_and_publish_a_service_category(): void
    {
        Bus::fake();
        $admin = $this->admin();

        $create = $this->actingAs($admin)->postJson('/api/admin/services/categories', [
            'kind' => ServiceCategoryKind::Axis->value,
            'title' => ['ar' => 'محور تجريبي', 'en' => 'Test axis'],
            'icon' => 'hard-hat',
        ])->assertCreated();

        $id = $create->json('id');
        $this->actingAs($admin)->postJson("/api/admin/services/categories/{$id}/publish")
            ->assertOk()
            ->assertJsonPath('status', 'published');

        $this->assertDatabaseHas('service_categories', ['id' => $id, 'icon' => 'hard-hat']);
    }

    public function test_admin_can_update_tools_with_icons(): void
    {
        Bus::fake();
        $admin = $this->admin();
        ContentBlock::query()->create([
            'page' => 'services',
            'section_key' => 'tools',
            'payload' => [
                'section_title' => ['ar' => 'الأدوات', 'en' => 'Tools'],
                'items' => [[
                    'title' => ['ar' => 'أداة', 'en' => 'Tool'],
                    'body' => ['ar' => 'وصف', 'en' => 'Body'],
                ]],
            ],
            'sort_order' => 1,
            'status' => PublicationStatus::Published,
            'published_at' => now(),
        ]);

        $this->actingAs($admin)->patchJson('/api/admin/services/tools', [
            'items' => [[
                'title' => ['ar' => 'أداة', 'en' => 'Tool'],
                'body' => ['ar' => 'وصف', 'en' => 'Body'],
                'icon' => 'drone',
            ]],
        ])->assertOk()->assertJsonPath('data.0.payload.items.0.icon', 'drone');
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(SuperAdminRole::NAME);

        return $user;
    }
}

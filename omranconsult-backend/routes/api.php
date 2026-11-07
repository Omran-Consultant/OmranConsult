<?php

use App\Http\Controllers\Api\Admin\LoginController;
use App\Http\Controllers\Api\Admin\LogoutController;
use App\Http\Controllers\Api\Admin\MeController;
use App\Http\Controllers\Api\Admin\PingController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Middleware\SetPublicLocale;
use App\Modules\Content\Presentation\Http\Controllers\HomeController;
use App\Modules\Content\Presentation\Http\Controllers\SettingsController;
use App\Modules\Documents\Presentation\Http\Controllers\DocumentsController;
use App\Modules\Inquiries\Presentation\Http\Controllers\InquiriesController;
use App\Modules\Partners\Presentation\Http\Controllers\PartnersController;
use App\Modules\Projects\Presentation\Http\Controllers\ClientsController;
use App\Modules\Projects\Presentation\Http\Controllers\ProjectsController;
use App\Modules\Projects\Presentation\Http\Controllers\RegionsController;
use App\Modules\Projects\Presentation\Http\Controllers\SectorsController;
use App\Modules\Services\Presentation\Http\Controllers\ServicesController;
use App\Modules\Team\Presentation\Http\Controllers\ExpertsController;
use App\Modules\Team\Presentation\Http\Controllers\OrgChartController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

// Public content reads (SDD §7.1). Published rows only; locale from Accept-Language (default en).
Route::middleware(SetPublicLocale::class)->group(function (): void {
    Route::get('/settings', SettingsController::class);
    Route::get('/home', HomeController::class);
    Route::get('/services', ServicesController::class);
    Route::get('/projects', [ProjectsController::class, 'index']);
    Route::get('/projects/{slug}', [ProjectsController::class, 'show']);
    Route::get('/clients', ClientsController::class);
    Route::get('/regions', RegionsController::class);
    Route::get('/sectors', SectorsController::class);
    Route::get('/experts', ExpertsController::class);
    Route::get('/org-chart', OrgChartController::class);
    Route::get('/documents', DocumentsController::class);
    Route::get('/partners', PartnersController::class);

    // Public writes (SDD §7.2): 5 per minute per IP (AppServiceProvider), honeypot field `website`.
    Route::post('/inquiries', InquiriesController::class)->middleware('throttle:inquiries');
});

Route::prefix('admin')->group(function (): void {
    // §10.5: 5 attempts / minute / IP + normalized email
    Route::post('/login', LoginController::class)->middleware('throttle:admin-login');

    Route::post('/logout', LogoutController::class)->middleware('auth:sanctum');

    Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function (): void {
        Route::get('/me', MeController::class);
        Route::get('/ping', PingController::class);
    });
});

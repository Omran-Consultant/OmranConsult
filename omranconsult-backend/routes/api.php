<?php

use App\Http\Controllers\Api\Admin\AcceptInviteController;
use App\Http\Controllers\Api\Admin\ForgotPasswordController;
use App\Http\Controllers\Api\Admin\LoginController;
use App\Http\Controllers\Api\Admin\LogoutController;
use App\Http\Controllers\Api\Admin\MeController;
use App\Http\Controllers\Api\Admin\MfaLoginController;
use App\Http\Controllers\Api\Admin\MfaSetupController;
use App\Http\Controllers\Api\Admin\PingController;
use App\Http\Controllers\Api\Admin\ProfileController;
use App\Http\Controllers\Api\Admin\ResetPasswordController;
use App\Http\Controllers\Api\Admin\SearchController;
use App\Http\Controllers\Api\E2ePreflightController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Internal\PreviewTokenLookupController;
use App\Http\Middleware\SetPublicLocale;
use App\Modules\Audit\Presentation\Http\Controllers\AdminAuditLogsController;
use App\Modules\Content\Presentation\Http\Controllers\HomeController;
use App\Modules\Content\Presentation\Http\Controllers\PagesController;
use App\Modules\Content\Presentation\Http\Controllers\SettingsController;
use App\Modules\Dashboard\Presentation\Http\Controllers\AdminSummaryController;
use App\Modules\Documents\Presentation\Http\Controllers\DocumentsController;
use App\Modules\Inquiries\Presentation\Http\Controllers\InquiriesController;
use App\Modules\Media\Presentation\Http\Controllers\AdminMediaController;
use App\Modules\News\Presentation\Http\Controllers\NewsController;
use App\Modules\Newsletter\Presentation\Http\Controllers\NewsletterController;
use App\Modules\Partners\Presentation\Http\Controllers\PartnersController;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Presentation\Http\Controllers\AdminProjectsController;
use App\Modules\Projects\Presentation\Http\Controllers\ClientsController;
use App\Modules\Projects\Presentation\Http\Controllers\ProjectsController;
use App\Modules\Projects\Presentation\Http\Controllers\RegionsController;
use App\Modules\Projects\Presentation\Http\Controllers\SectorsController;
use App\Modules\Services\Presentation\Http\Controllers\ServicesController;
use App\Modules\Team\Presentation\Http\Controllers\ExpertsController;
use App\Modules\Team\Presentation\Http\Controllers\OrgChartController;
use App\Modules\Users\Presentation\Http\Controllers\AdminUsersController;
use App\Support\DashboardPermission;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);
Route::get('/e2e/preflight', E2ePreflightController::class);

Route::get('/internal/preview-tokens', PreviewTokenLookupController::class)
    ->middleware('throttle:preview-token-lookup');

// Public content reads (SDD §7.1). 120/min/IP; trusted egress IPs and a matching X-Omran-Frontend-Key skip that cap.
Route::middleware([SetPublicLocale::class, 'throttle:public-read'])->group(function (): void {
    Route::get('/settings', SettingsController::class);
    Route::get('/home', HomeController::class);
    Route::get('/pages/{page}', PagesController::class);
    Route::get('/services', ServicesController::class);
    Route::get('/projects', [ProjectsController::class, 'index']);
    Route::get('/projects/{slug}', [ProjectsController::class, 'show']);
    Route::get('/clients', ClientsController::class);
    Route::get('/regions', RegionsController::class);
    Route::get('/sectors', SectorsController::class);
    Route::get('/news-categories', [NewsController::class, 'categories']);
    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{slug}', [NewsController::class, 'show']);
    Route::get('/experts', ExpertsController::class);
    Route::get('/org-chart', OrgChartController::class);
    Route::get('/documents', DocumentsController::class);
    Route::get('/partners', PartnersController::class);
});

Route::middleware(SetPublicLocale::class)->group(function (): void {
    Route::post('/inquiries', InquiriesController::class)->middleware('throttle:inquiries');
    Route::post('/newsletter', NewsletterController::class)->middleware('throttle:newsletter');
});

Route::prefix('admin')->group(function (): void {
    Route::post('/login', LoginController::class)->middleware('throttle:admin-login');
    Route::post('/login/mfa', MfaLoginController::class)->middleware('throttle:admin-mfa');
    Route::post('/forgot-password', ForgotPasswordController::class)->middleware('throttle:admin-login');
    Route::post('/reset-password', ResetPasswordController::class)->middleware('throttle:admin-login');
    Route::post('/accept-invite', AcceptInviteController::class)->middleware('throttle:admin-login');

    Route::post('/logout', LogoutController::class)->middleware('auth:sanctum');

    Route::middleware(['auth:sanctum', 'dashboard'])->group(function (): void {
        Route::get('/me', MeController::class);
        Route::patch('/me', [ProfileController::class, 'update']);
        Route::get('/ping', PingController::class);
        Route::post('/me/mfa/start', [MfaSetupController::class, 'start']);
        Route::post('/me/mfa/confirm', [MfaSetupController::class, 'confirm']);
        Route::delete('/me/mfa', [MfaSetupController::class, 'destroy']);
        Route::get('/dashboard/summary', AdminSummaryController::class)->middleware('permission:'.DashboardPermission::SUMMARY_VIEW);
        Route::get('/search', SearchController::class)->middleware('permission:'.DashboardPermission::PROJECTS_VIEW);

        Route::middleware('permission:'.DashboardPermission::USERS_VIEW)->group(function (): void {
            Route::get('/users', [AdminUsersController::class, 'index']);
        });
        Route::middleware('permission:'.DashboardPermission::USERS_CREATE)->group(function (): void {
            Route::post('/users', [AdminUsersController::class, 'store']);
            Route::post('/users/invitations/{invitation}/resend', [AdminUsersController::class, 'resendInvite']);
        });
        Route::middleware('permission:'.DashboardPermission::USERS_UPDATE)->group(function (): void {
            Route::patch('/users/{user}', [AdminUsersController::class, 'update']);
            Route::post('/users/{user}/reset-mfa', [AdminUsersController::class, 'resetMfa']);
            Route::post('/users/{user}/revoke-sessions', [AdminUsersController::class, 'revokeSessions']);
            Route::post('/users/invitations/{invitation}/revoke', [AdminUsersController::class, 'revokeInvite']);
        });

        Route::get('/audit-logs', AdminAuditLogsController::class)->middleware('permission:'.DashboardPermission::AUDIT_VIEW);

        Route::bind('project', fn (string $value) => Project::withTrashed()->whereKey($value)->firstOrFail());

        Route::middleware('permission:'.DashboardPermission::PROJECTS_VIEW)->group(function (): void {
            Route::get('/projects', [AdminProjectsController::class, 'index']);
            Route::get('/projects/{project}', [AdminProjectsController::class, 'show']);
        });
        Route::post('/projects', [AdminProjectsController::class, 'store'])
            ->middleware('permission:'.DashboardPermission::PROJECTS_CREATE);
        Route::middleware('permission:'.DashboardPermission::PROJECTS_UPDATE)->group(function (): void {
            Route::patch('/projects/{project}', [AdminProjectsController::class, 'update']);
            Route::post('/projects/{project}/discard-draft', [AdminProjectsController::class, 'discardDraft']);
        });
        Route::post('/projects/{project}/publish', [AdminProjectsController::class, 'publish'])
            ->middleware('permission:'.DashboardPermission::PROJECTS_PUBLISH);
        Route::delete('/projects/{project}', [AdminProjectsController::class, 'destroy'])
            ->middleware('permission:'.DashboardPermission::PROJECTS_DELETE);
        Route::post('/projects/{project}/restore', [AdminProjectsController::class, 'restore'])
            ->middleware('permission:'.DashboardPermission::PROJECTS_RESTORE);
        Route::post('/projects/{project}/preview-token', [AdminProjectsController::class, 'previewToken'])
            ->middleware('permission:'.DashboardPermission::PREVIEW);

        Route::middleware('permission:'.DashboardPermission::MEDIA_VIEW)->group(function (): void {
            Route::get('/media', [AdminMediaController::class, 'index']);
            Route::get('/media/{media}', [AdminMediaController::class, 'show']);
        });
        Route::post('/media', [AdminMediaController::class, 'store'])
            ->middleware(['permission:'.DashboardPermission::MEDIA_CREATE, 'throttle:admin-media-upload']);
        Route::patch('/media/{media}', [AdminMediaController::class, 'update'])
            ->middleware('permission:'.DashboardPermission::MEDIA_UPDATE);
        Route::delete('/media/{media}', [AdminMediaController::class, 'destroy'])
            ->middleware('permission:'.DashboardPermission::MEDIA_DELETE);
        Route::delete('/media/{media}/force', [AdminMediaController::class, 'forceDestroy'])
            ->middleware('permission:'.DashboardPermission::MEDIA_FORCE_DELETE);
    });
});

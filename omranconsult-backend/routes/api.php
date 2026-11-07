<?php

use App\Http\Controllers\Api\Admin\LoginController;
use App\Http\Controllers\Api\Admin\LogoutController;
use App\Http\Controllers\Api\Admin\MeController;
use App\Http\Controllers\Api\Admin\PingController;
use App\Http\Controllers\Api\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::prefix('admin')->group(function (): void {
    // §10.5: 5 attempts / minute / IP + normalized email
    Route::post('/login', LoginController::class)->middleware('throttle:admin-login');

    Route::post('/logout', LogoutController::class)->middleware('auth:sanctum');

    Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function (): void {
        Route::get('/me', MeController::class);
        Route::get('/ping', PingController::class);
    });
});

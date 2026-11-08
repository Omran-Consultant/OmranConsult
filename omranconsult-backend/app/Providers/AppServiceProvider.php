<?php

namespace App\Providers;

use App\Support\FrontendServerKey;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('admin-login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(5)->by($request->ip().'|'.$email);
        });

        RateLimiter::for('public-read', function (Request $request) {
            $ip = (string) $request->ip();

            if (in_array($ip, config('security.public_read_trusted_ips', []), true)) {
                return Limit::none();
            }

            if (FrontendServerKey::matches($request->header('X-Omran-Frontend-Key'))) {
                return Limit::none();
            }

            return Limit::perMinute(120)->by($ip);
        });

        // Public writes (SDD §7.2): 5 per minute per IP.
        RateLimiter::for('inquiries', fn (Request $request) => Limit::perMinute(5)->by((string) $request->ip()));
        RateLimiter::for('newsletter', fn (Request $request) => Limit::perMinute(5)->by((string) $request->ip()));
    }
}

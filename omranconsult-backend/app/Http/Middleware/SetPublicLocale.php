<?php

namespace App\Http\Middleware;

use App\Support\Content\PublicLocale;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies the Accept-Language locale to public content reads and marks the
 * response as language-dependent for caches.
 */
class SetPublicLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale(PublicLocale::fromRequest($request));

        $response = $next($request);

        $response->headers->set('Content-Language', app()->getLocale());
        $response->setVary('Accept-Language', false);

        return $response;
    }
}

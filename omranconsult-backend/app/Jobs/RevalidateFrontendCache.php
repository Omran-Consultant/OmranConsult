<?php

namespace App\Jobs;

use App\Support\Audit\AuditLogger;
use App\Support\Cms\CmsFrontendUrl;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class RevalidateFrontendCache implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /**
     * @param  list<string>  $tags
     */
    public function __construct(public readonly array $tags) {}

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [10, 30, 60, 120];
    }

    public function handle(): void
    {
        $secret = (string) config('cms.revalidation_secret');
        $frontend = CmsFrontendUrl::forRevalidation();
        if ($secret === '' || $frontend === '') {
            return;
        }

        $response = Http::timeout(10)
            ->withToken($secret)
            ->acceptJson()
            ->post($frontend.'/cms/revalidate', [
                'tags' => array_values(array_unique($this->tags)),
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('revalidation_failed:'.$response->status());
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::warning('revalidation_failed', [
            'tags' => $this->tags,
            'error' => $exception?->getMessage(),
        ]);
        app(AuditLogger::class)->write(null, 'revalidation_failed', null, null, [
            'tags' => $this->tags,
        ]);
    }
}

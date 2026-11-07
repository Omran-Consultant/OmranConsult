<?php

namespace Tests\Feature\Content;

use App\Modules\Newsletter\Infrastructure\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * POST /api/newsletter (SDD §7.2, P20).
 */
class NewsletterApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('newsletter');
    }

    public function test_new_email_is_subscribed(): void
    {
        $this->postJson('/api/newsletter', ['email' => ' Sara@Example.com ', 'consent' => true], ['Accept-Language' => 'ar'])
            ->assertCreated()
            ->assertJsonPath('message', 'شكراً لك، تم اشتراكك في النشرة البريدية.');

        $subscriber = NewsletterSubscriber::query()->sole();
        $this->assertSame('sara@example.com', $subscriber->email);
        $this->assertSame('ar', $subscriber->locale);
        $this->assertNotNull($subscriber->consented_at);
    }

    public function test_repeat_email_is_idempotent(): void
    {
        $this->postJson('/api/newsletter', ['email' => 'sara@example.com', 'consent' => true])->assertCreated();
        $first = $this->postJson('/api/newsletter', ['email' => 'SARA@example.com', 'consent' => true])->assertOk();

        $this->assertSame('Thank you. You are subscribed to our newsletter.', $first->json('message'));
        $this->assertSame(1, NewsletterSubscriber::query()->count());
    }

    public function test_invalid_email_and_missing_consent_are_rejected(): void
    {
        $this->postJson('/api/newsletter', ['email' => 'nope', 'consent' => true])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/newsletter', ['email' => 'sara@example.com'])->assertUnprocessable()->assertJsonValidationErrors('consent');
        $this->assertSame(0, NewsletterSubscriber::query()->count());
    }

    public function test_sixth_request_in_a_minute_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/newsletter', ['email' => "user{$i}@example.com", 'consent' => true])->assertCreated();
        }

        $this->postJson('/api/newsletter', ['email' => 'late@example.com', 'consent' => true])->assertTooManyRequests();
    }
}

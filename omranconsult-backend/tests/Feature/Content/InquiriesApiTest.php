<?php

namespace Tests\Feature\Content;

use App\Modules\Inquiries\Domain\InquirySource;
use App\Modules\Inquiries\Domain\InquiryStatus;
use App\Modules\Inquiries\Infrastructure\Models\Inquiry;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\PublicationStatus;
use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * POST /api/inquiries (SDD §7.2, P19).
 */
class InquiriesApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProfileContentSeeder::class);
        RateLimiter::clear('inquiries');
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function contact(array $overrides = []): array
    {
        return [
            'name' => 'Sara Ahmed',
            'organisation' => 'Ministry',
            'email' => 'sara@example.com',
            'phone' => '0551234567',
            'service_type' => 'engineering-consulting',
            'message' => 'We need a consultation.',
            'consent' => true,
            'source' => 'contact',
            ...$overrides,
        ];
    }

    public function test_contact_inquiry_is_stored_as_new(): void
    {
        $this->postJson('/api/inquiries', $this->contact(), ['Accept-Language' => 'en'])
            ->assertCreated()
            ->assertExactJson(['message' => 'We have received your request and will contact you within two working days.']);

        $inquiry = Inquiry::query()->sole();
        $this->assertSame(InquiryStatus::New, $inquiry->status);
        $this->assertSame(InquirySource::Contact, $inquiry->source);
        $this->assertSame('en', $inquiry->locale);
        $this->assertTrue($inquiry->consent);
        $this->assertNull($inquiry->project_id);
        $this->assertSame(64, strlen($inquiry->ip_hash));
        $this->assertStringNotContainsString('127.0.0.1', $inquiry->ip_hash);
    }

    public function test_arabic_success_message(): void
    {
        $this->postJson('/api/inquiries', $this->contact(), ['Accept-Language' => 'ar'])
            ->assertCreated()
            ->assertJsonPath('message', 'استلمنا طلبك، سنتواصل معك خلال يومي عمل');
    }

    public function test_project_inquiry_links_the_project_without_consent(): void
    {
        $this->postJson('/api/inquiries', [
            'name' => 'Omar',
            'organisation' => 'University',
            'email' => 'omar@example.com',
            'source' => 'project',
            'project_slug' => 'cop16-technical-audit',
        ])->assertCreated();

        $inquiry = Inquiry::query()->sole();
        $this->assertSame(Project::query()->where('slug', 'cop16-technical-audit')->value('id'), $inquiry->project_id);
        $this->assertFalse($inquiry->consent);
    }

    public function test_project_inquiry_needs_a_published_project(): void
    {
        Project::query()->where('slug', 'cop16-technical-audit')->update(['status' => PublicationStatus::Draft->value]);

        $this->postJson('/api/inquiries', ['name' => 'Omar', 'email' => 'omar@example.com', 'source' => 'project'])
            ->assertUnprocessable()->assertJsonValidationErrors('project_slug');
        $this->postJson('/api/inquiries', ['name' => 'Omar', 'email' => 'omar@example.com', 'source' => 'project', 'project_slug' => 'cop16-technical-audit'])
            ->assertUnprocessable()->assertJsonValidationErrors('project_slug');
    }

    /**
     * @return array<string, array{0: array<string, mixed>, 1: string}>
     */
    public static function invalidContacts(): array
    {
        return [
            'missing name' => [['name' => ''], 'name'],
            'missing email' => [['email' => null], 'email'],
            'bad email' => [['email' => 'not-an-email'], 'email'],
            'landline' => [['phone' => '0114999925'], 'phone'],
            'short mobile' => [['phone' => '055123456'], 'phone'],
            'foreign number' => [['phone' => '+447700900123'], 'phone'],
            'long message' => [['message' => str_repeat('a', 2001)], 'message'],
            'no consent on contact' => [['consent' => false], 'consent'],
            'unknown service type' => [['service_type' => 'nope'], 'service_type'],
            'unknown source' => [['source' => 'email'], 'source'],
        ];
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    #[DataProvider('invalidContacts')]
    public function test_invalid_input_is_rejected(array $overrides, string $field): void
    {
        $this->postJson('/api/inquiries', $this->contact($overrides))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($field);

        $this->assertSame(0, Inquiry::query()->count());
    }

    public function test_accepted_phone_formats_are_normalised(): void
    {
        $this->postJson('/api/inquiries', $this->contact(['phone' => '+966 55 123 4567']))->assertCreated();
        $this->postJson('/api/inquiries', $this->contact(['phone' => '055-123-4567']))->assertCreated();

        $this->assertSame(['+966551234567', '0551234567'], Inquiry::query()->orderBy('id')->pluck('phone')->all());
    }

    public function test_message_of_2000_characters_is_accepted(): void
    {
        $this->postJson('/api/inquiries', $this->contact(['message' => str_repeat('م', 2000)]))->assertCreated();
    }

    public function test_honeypot_answers_normally_but_stores_nothing(): void
    {
        $this->postJson('/api/inquiries', $this->contact(['website' => 'http://spam.example']))->assertCreated();

        $this->assertSame(0, Inquiry::query()->count());
    }

    public function test_sixth_request_in_a_minute_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/inquiries', $this->contact())->assertCreated();
        }

        $this->postJson('/api/inquiries', $this->contact())->assertTooManyRequests();
        $this->assertSame(5, Inquiry::query()->count());
    }
}

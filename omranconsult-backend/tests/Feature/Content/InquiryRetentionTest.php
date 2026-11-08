<?php

namespace Tests\Feature\Content;

use App\Modules\Inquiries\Domain\InquiryStatus;
use App\Modules\Inquiries\Infrastructure\Models\Inquiry;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class InquiryRetentionTest extends TestCase
{
    use RefreshDatabase;

    public function test_prune_deletes_only_closed_and_rejected_inquiries_older_than_24_months(): void
    {
        Carbon::setTestNow('2026-11-08 12:00:00');

        $oldClosed = $this->inquiry(InquiryStatus::Closed, now()->subMonths(24)->subSecond());
        $oldRejected = $this->inquiry(InquiryStatus::Rejected, now()->subMonths(30));
        $oldInReview = $this->inquiry(InquiryStatus::InReview, now()->subMonths(30));
        $recentClosed = $this->inquiry(InquiryStatus::Closed, now()->subMonths(12));

        $this->artisan('inquiries:prune')->assertSuccessful();

        $this->assertDatabaseMissing('inquiries', ['id' => $oldClosed->id]);
        $this->assertDatabaseMissing('inquiries', ['id' => $oldRejected->id]);
        $this->assertDatabaseHas('inquiries', ['id' => $oldInReview->id]);
        $this->assertDatabaseHas('inquiries', ['id' => $recentClosed->id]);

        Carbon::setTestNow();
    }

    public function test_inquiry_prune_is_scheduled(): void
    {
        $scheduled = collect(app(Schedule::class)->events())
            ->contains(fn ($event): bool => str_contains($event->command ?? '', 'inquiries:prune'));

        $this->assertTrue($scheduled);
    }

    private function inquiry(InquiryStatus $status, Carbon $createdAt): Inquiry
    {
        $inquiry = Inquiry::query()->create([
            'name' => 'Retention test',
            'email' => 'retention@example.com',
            'consented_at' => null,
            'source' => 'contact',
            'locale' => 'en',
            'status' => $status,
            'ip_hash' => hash('sha256', 'retention-test'),
        ]);

        $inquiry->timestamps = false;
        $inquiry->forceFill(['created_at' => $createdAt, 'updated_at' => $createdAt])->save();

        return $inquiry;
    }
}

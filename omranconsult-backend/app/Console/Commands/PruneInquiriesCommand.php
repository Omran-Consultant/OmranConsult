<?php

namespace App\Console\Commands;

use App\Modules\Inquiries\Domain\InquiryStatus;
use App\Modules\Inquiries\Infrastructure\Models\Inquiry;
use Illuminate\Console\Command;

class PruneInquiriesCommand extends Command
{
    protected $signature = 'inquiries:prune';

    protected $description = 'Delete closed and rejected inquiries older than 24 months.';

    public function handle(): int
    {
        $deleted = Inquiry::query()
            ->whereIn('status', [InquiryStatus::Closed, InquiryStatus::Rejected])
            ->where('created_at', '<', now()->subMonthsNoOverflow(24))
            ->delete();

        $this->components->info("Pruned {$deleted} expired inquiries.");

        return self::SUCCESS;
    }
}

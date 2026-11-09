<?php

namespace App\Modules\Dashboard\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Audit\Infrastructure\Models\AuditLog;
use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Documents\Infrastructure\Models\Document;
use App\Modules\Inquiries\Domain\InquiryStatus;
use App\Modules\Inquiries\Infrastructure\Models\Inquiry;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Sector;
use App\Support\Content\PublicationStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminSummaryController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $published = Project::query()->where('status', PublicationStatus::Published)->count();
        $draftStatus = Project::query()->where('status', PublicationStatus::Draft)->count();
        $contentDrafts = ContentDraft::query()->count();
        $projectsTotal = $published + $draftStatus;
        $newInquiries = Inquiry::query()->where('status', InquiryStatus::New)->count();
        $inquiriesThisMonth = Inquiry::query()
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        $inquiriesLastMonth = Inquiry::query()
            ->whereBetween('created_at', [now()->subMonthNoOverflow()->startOfMonth(), now()->startOfMonth()])
            ->count();
        $openDisputes = ContentDispute::query()->whereIn('status', ['pending', 'rejected'])->count();
        $disputesBlocking = ContentDispute::query()->where('status', 'pending')->where('blocks_publish', true)->count();
        $expiredCertificates = Document::query()
            ->whereNotNull('valid_until')
            ->whereDate('valid_until', '<', now()->toDateString())
            ->count();
        $certificatesTotal = Document::query()->whereNotNull('valid_until')->count();
        $lastDraftEdit = ContentDraft::query()->max('updated_at') ?? Project::query()->max('updated_at');

        $chart = $this->inquiriesChart();
        $sectors = Sector::query()
            ->withCount(['projects as published_projects_count' => fn ($query) => $query->where('status', PublicationStatus::Published)])
            ->orderBy('sort_order')
            ->get(['id', 'slug', 'name']);

        return response()->json([
            'kpis' => [
                'projects_total' => $projectsTotal,
                'projects_published' => $published,
                'projects_draft' => $draftStatus + $contentDrafts,
                'projects_content_drafts' => $contentDrafts,
                'inquiries_new' => $newInquiries,
                'inquiries_this_month' => $inquiriesThisMonth,
                'inquiries_last_month' => $inquiriesLastMonth,
                'drafts_awaiting_publish' => $contentDrafts + $draftStatus,
                'last_content_edit_at' => $lastDraftEdit,
                'open_disputes' => $openDisputes,
                'disputes_blocking_publish' => $disputesBlocking,
                'expired_certificates' => $expiredCertificates,
                'certificates_total' => $certificatesTotal,
            ],
            'inquiries_chart' => $chart,
            'sectors' => $sectors->map(fn (Sector $sector): array => [
                'slug' => $sector->slug,
                'name' => $sector->name,
                'count' => (int) $sector->published_projects_count,
            ])->values(),
            'latest_inquiries' => Inquiry::query()->orderByDesc('id')->limit(5)->get(['id', 'name', 'email', 'status', 'created_at']),
            'latest_edits' => Project::query()->orderByDesc('updated_at')->limit(5)->get(['id', 'slug', 'title', 'status', 'updated_at']),
            'recent_activity' => AuditLog::query()->orderByDesc('occurred_at')->limit(8)->get([
                'id', 'action', 'subject_type', 'subject_id', 'occurred_at', 'user_id',
            ]),
        ]);
    }

    /**
     * @return list<array{month: string, count: int}>
     */
    private function inquiriesChart(): array
    {
        $start = now()->startOfMonth()->subMonthsNoOverflow(11);
        $driver = DB::connection()->getDriverName();
        $monthExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $counts = Inquiry::query()
            ->where('created_at', '>=', $start)
            ->selectRaw($monthExpr.' as month, COUNT(*) as aggregate')
            ->groupBy('month')
            ->pluck('aggregate', 'month');

        $series = [];
        for ($i = 0; $i < 12; $i++) {
            $month = $start->copy()->addMonthsNoOverflow($i)->format('Y-m');
            $series[] = [
                'month' => $month,
                'count' => (int) ($counts[$month] ?? 0),
            ];
        }

        return $series;
    }
}

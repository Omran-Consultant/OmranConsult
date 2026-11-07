<?php

namespace App\Modules\Inquiries\Domain;

/**
 * Inbox workflow (spec: new → in review → closed / rejected). Changed from the dashboard (Phase 5).
 */
enum InquiryStatus: string
{
    case New = 'new';
    case InReview = 'in_review';
    case Closed = 'closed';
    case Rejected = 'rejected';
}

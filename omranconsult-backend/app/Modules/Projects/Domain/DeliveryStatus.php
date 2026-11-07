<?php

namespace App\Modules\Projects\Domain;

/**
 * Whether a project is finished (SDD §6.7 P18). Null when unknown.
 */
enum DeliveryStatus: string
{
    case Completed = 'completed';
    case Ongoing = 'ongoing';
}

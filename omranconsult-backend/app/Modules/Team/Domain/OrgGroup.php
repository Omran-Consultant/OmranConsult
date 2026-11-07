<?php

namespace App\Modules\Team\Domain;

/**
 * Organizational-chart groups from the profile (PROFILE_INVENTORY §3.19).
 */
enum OrgGroup: string
{
    case Board = 'board';
    case BoardCommittees = 'board_committees';
    case ExecutiveManagement = 'executive_management';
    case Committees = 'committees';
    case Projects = 'projects';
    case PlanningControl = 'planning_control';
}

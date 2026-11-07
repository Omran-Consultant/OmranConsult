<?php

namespace App\Modules\Services\Domain;

enum ServiceCategoryKind: string
{
    case Axis = 'axis';
    case AssetManagement = 'asset_management';
    case EngineeringDesign = 'engineering_design';
}

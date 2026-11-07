<?php

namespace App\Modules\Documents\Domain;

enum DocumentKind: string
{
    case License = 'license';
    case IsoCertificate = 'iso_certificate';
    case CompanyProfile = 'company_profile';
}

<?php

namespace App\Modules\Inquiries\Domain;

enum InquirySource: string
{
    case Contact = 'contact';
    case Project = 'project';
}

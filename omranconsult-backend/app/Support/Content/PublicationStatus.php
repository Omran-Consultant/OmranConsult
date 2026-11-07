<?php

namespace App\Support\Content;

enum PublicationStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
}

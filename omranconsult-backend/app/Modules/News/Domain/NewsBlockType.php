<?php

namespace App\Modules\News\Domain;

/**
 * Article body block types (SDD P21). No HTML is stored, so nothing needs sanitising.
 */
enum NewsBlockType: string
{
    case Paragraph = 'paragraph';
    case Heading = 'heading';
    case Quote = 'quote';
    case Image = 'image';
}

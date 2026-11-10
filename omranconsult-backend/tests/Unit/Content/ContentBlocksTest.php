<?php

namespace Tests\Unit\Content;

use App\Support\Content\ContentBlocks;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ContentBlocksTest extends TestCase
{
    public function test_legacy_text_becomes_one_plain_paragraph(): void
    {
        $blocks = ContentBlocks::coerce('نبذة عن المشروع');

        $this->assertSame('نبذة عن المشروع', ContentBlocks::plainParagraph($blocks));
        $this->assertTrue(ContentBlocks::hasVisibleText($blocks));
    }

    public function test_unknown_type_mark_and_link_scheme_are_rejected(): void
    {
        $this->expectException(ValidationException::class);
        ContentBlocks::validate([
            ['type' => 'html', 'children' => [['text' => 'x']]],
        ], 'overview');
    }

    public function test_link_must_be_http_or_mailto(): void
    {
        $this->expectException(ValidationException::class);
        ContentBlocks::validate([
            ['type' => 'paragraph', 'children' => [['text' => 'x', 'href' => 'javascript:alert(1)']]],
        ], 'overview');
    }

    public function test_heading_list_quote_and_marks_are_kept(): void
    {
        $blocks = ContentBlocks::validateLocaleMap([
            'ar' => [[
                'type' => 'list',
                'style' => 'number',
                'items' => [[['text' => 'أول', 'bold' => true]]],
            ]],
            'en' => [[
                'type' => 'heading',
                'level' => 'h2',
                'children' => [['text' => 'Title', 'italic' => true, 'href' => 'https://omran.example']],
            ], [
                'type' => 'quote',
                'children' => [['text' => 'Said']],
            ]],
        ], 'overview');

        $this->assertSame('number', $blocks['ar'][0]['style']);
        $this->assertTrue($blocks['en'][0]['children'][0]['italic']);
        $this->assertSame('https://omran.example', $blocks['en'][0]['children'][0]['href']);
        $this->assertNull(ContentBlocks::plainParagraph($blocks['en']));
    }

    public function test_empty_text_nulled_by_the_request_middleware_is_an_empty_paragraph(): void
    {
        $blocks = ContentBlocks::validate([
            ['type' => 'paragraph', 'children' => [['text' => null]]],
        ], 'overview');

        $this->assertSame('', $blocks[0]['children'][0]['text']);
        $this->assertFalse(ContentBlocks::hasVisibleText($blocks));
    }

    public function test_image_blocks_are_rejected_for_projects(): void
    {
        $this->expectException(ValidationException::class);
        ContentBlocks::validate([
            ['type' => 'image', 'media_id' => 1, 'alt' => ['ar' => 'صورة', 'en' => 'Photo']],
        ], 'overview');
    }

    public function test_clearing_non_empty_locale_map_requires_confirm(): void
    {
        $this->expectException(ValidationException::class);
        ContentBlocks::assertNotClearingLocaleMap(
            [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نص']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Text']]]],
            ],
            [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => '']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Text']]]],
            ],
            'body',
            false,
        );
    }

    public function test_confirm_clear_allows_emptying_locale_map(): void
    {
        ContentBlocks::assertNotClearingLocaleMap(
            [
                'ar' => [['type' => 'paragraph', 'children' => [['text' => 'نص']]]],
                'en' => [['type' => 'paragraph', 'children' => [['text' => 'Text']]]],
            ],
            [
                'ar' => [],
                'en' => [],
            ],
            'overview',
            true,
        );
        $this->assertTrue(true);
    }
}

<?php

namespace Tests\Unit\Content;

use App\Modules\Content\Application\BlockPayloadShape;
use PHPUnit\Framework\TestCase;

class BlockPayloadShapeTest extends TestCase
{
    /**
     * @return array<string, mixed>
     */
    private function live(): array
    {
        return [
            'section_title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'nested' => ['overline' => ['ar' => 'ABOUT', 'en' => 'ABOUT']],
            'items' => [
                ['number' => '01', 'icon' => 'building', 'href' => '/services#pillars', 'title' => ['ar' => 'أ', 'en' => 'A']],
                ['number' => '02', 'icon' => 'building', 'href' => '/services#pillars', 'title' => ['ar' => 'ب', 'en' => 'B']],
            ],
            'body' => [['ar' => 'فقرة', 'en' => 'Paragraph']],
        ];
    }

    public function test_the_live_payload_and_a_text_edit_fit(): void
    {
        $edited = $this->live();
        $edited['section_title']['ar'] = 'عنوان جديد';
        $edited['nested']['overline']['en'] = '';

        $this->assertSame([], BlockPayloadShape::errors($this->live(), $this->live()));
        $this->assertSame([], BlockPayloadShape::errors($this->live(), $edited));
    }

    public function test_list_items_can_be_added_removed_and_reordered_in_the_same_shape(): void
    {
        $edited = $this->live();
        $edited['items'] = [$edited['items'][1], $edited['items'][0], ['number' => '03', 'icon' => 'layers', 'href' => '#contact', 'title' => ['ar' => 'ج', 'en' => 'C']]];
        $edited['body'][] = ['ar' => 'فقرة ثانية', 'en' => 'Second paragraph'];

        $this->assertSame([], BlockPayloadShape::errors($this->live(), $edited));

        $edited['items'] = [$edited['items'][0]];
        $this->assertSame([], BlockPayloadShape::errors($this->live(), $edited));
    }

    public function test_a_missing_or_extra_key_is_rejected(): void
    {
        $missing = $this->live();
        unset($missing['nested']);
        $extra = $this->live();
        $extra['items'][0]['style'] = 'bold';

        $this->assertSame(['payload' => ['shape_mismatch']], BlockPayloadShape::errors($this->live(), $missing));
        $this->assertSame(['payload.items.0' => ['shape_mismatch']], BlockPayloadShape::errors($this->live(), $extra));
    }

    public function test_a_translation_map_cannot_become_a_string_or_gain_a_locale(): void
    {
        $flattened = $this->live();
        $flattened['section_title'] = 'Title';
        $third = $this->live();
        $third['section_title']['fr'] = 'Titre';
        $typed = $this->live();
        $typed['section_title']['ar'] = ['x'];

        $this->assertSame(['payload.section_title' => ['shape_mismatch']], BlockPayloadShape::errors($this->live(), $flattened));
        $this->assertSame(['payload.section_title' => ['shape_mismatch']], BlockPayloadShape::errors($this->live(), $third));
        $this->assertSame(['payload.section_title.ar' => ['shape_mismatch']], BlockPayloadShape::errors($this->live(), $typed));
    }

    public function test_lists_cannot_be_emptied_or_grow_past_the_cap(): void
    {
        $emptied = $this->live();
        $emptied['items'] = [];
        $huge = $this->live();
        $huge['body'] = array_fill(0, BlockPayloadShape::MAX_ITEMS + 1, ['ar' => 'س', 'en' => 's']);

        $this->assertSame(['payload.items' => ['items_required']], BlockPayloadShape::errors($this->live(), $emptied));
        $this->assertSame(['payload.body' => ['too_many_items']], BlockPayloadShape::errors($this->live(), $huge));
    }

    public function test_icons_come_from_the_semantic_map_and_links_stay_internal(): void
    {
        $icon = $this->live();
        $icon['items'][0]['icon'] = 'rocket';
        $this->assertSame(['payload.items.0.icon' => ['invalid_icon']], BlockPayloadShape::errors($this->live(), $icon));

        foreach (['https://example.com', '//example.com', 'javascript:alert(1)', 'services'] as $href) {
            $link = $this->live();
            $link['items'][1]['href'] = $href;
            $this->assertSame(['payload.items.1.href' => ['invalid_href']], BlockPayloadShape::errors($this->live(), $link), $href);
        }
    }

    public function test_text_length_is_capped(): void
    {
        $long = $this->live();
        $long['section_title']['en'] = str_repeat('a', BlockPayloadShape::MAX_TEXT + 1);
        $number = $this->live();
        $number['items'][0]['number'] = str_repeat('1', BlockPayloadShape::MAX_SCALAR + 1);

        $this->assertSame(['payload.section_title.en' => ['too_long']], BlockPayloadShape::errors($this->live(), $long));
        $this->assertSame(['payload.items.0.number' => ['too_long']], BlockPayloadShape::errors($this->live(), $number));
    }

    public function test_half_translated_maps_are_listed_by_path(): void
    {
        $payload = $this->live();
        $payload['section_title']['en'] = '  ';
        $payload['items'][1]['title']['ar'] = null;
        $payload['nested']['overline'] = ['ar' => '', 'en' => ''];

        $this->assertSame(
            ['payload.section_title', 'payload.items.1.title'],
            BlockPayloadShape::halfTranslated($payload),
        );
    }
}

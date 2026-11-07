<?php

namespace Tests\Unit\Content;

use App\Modules\Documents\Infrastructure\Models\Document;
use App\Support\Content\PublicLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicLocaleTest extends TestCase
{
    /**
     * @return array<string, array{0: string|null, 1: string}>
     */
    public static function acceptLanguageHeaders(): array
    {
        return [
            'missing' => [null, 'en'],
            'arabic' => ['ar', 'ar'],
            'arabic region' => ['ar-SA,ar;q=0.9', 'ar'],
            'english region' => ['en-US', 'en'],
            'weighted english first' => ['ar;q=0.5,en;q=0.9', 'en'],
            'unsupported' => ['fr', 'en'],
        ];
    }

    #[DataProvider('acceptLanguageHeaders')]
    public function test_locale_from_accept_language(?string $header, string $expected): void
    {
        $request = Request::create('/api/home');
        if ($header !== null) {
            $request->headers->set('Accept-Language', $header);
        }

        $this->assertSame($expected, PublicLocale::fromRequest($request));
    }

    public function test_pick_returns_null_for_missing_or_empty_strings(): void
    {
        $this->assertSame('نص', PublicLocale::pick(['ar' => 'نص', 'en' => 'Text'], 'ar'));
        $this->assertNull(PublicLocale::pick(['ar' => 'نص', 'en' => null], 'en'));
        $this->assertNull(PublicLocale::pick(['ar' => 'نص', 'en' => ''], 'en'));
        $this->assertNull(PublicLocale::pick(null, 'en'));
    }

    public function test_resolve_tree_resolves_nested_maps_only(): void
    {
        $payload = [
            'title' => ['ar' => 'عنوان', 'en' => 'Title'],
            'items' => [
                ['title' => ['ar' => 'أ', 'en' => 'A'], 'icon' => 'star'],
                ['ar' => 'ب', 'en' => null],
            ],
            'phones' => ['+966', '+967'],
            'meta' => ['ar' => 'x', 'en' => 'y', 'extra' => 'z'],
        ];

        $this->assertSame([
            'title' => 'Title',
            'items' => [
                ['title' => 'A', 'icon' => 'star'],
                null,
            ],
            'phones' => ['+966', '+967'],
            'meta' => ['ar' => 'x', 'en' => 'y', 'extra' => 'z'],
        ], PublicLocale::resolveTree($payload, 'en'));
    }

    public function test_document_expiry_compares_against_today(): void
    {
        Carbon::setTestNow('2026-11-07 15:00:00');

        $this->assertTrue((new Document(['valid_until' => '2026-11-06']))->isExpired());
        $this->assertFalse((new Document(['valid_until' => '2026-11-07']))->isExpired());
        $this->assertFalse((new Document(['valid_until' => null]))->isExpired());

        Carbon::setTestNow();
    }
}

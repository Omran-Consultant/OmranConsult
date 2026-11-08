<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->string('slug', 64)->nullable()->unique()->after('id');
        });

        foreach (DB::table('documents')->orderBy('id')->get() as $document) {
            $slug = $this->slugFor($document);
            if ($slug !== null) {
                DB::table('documents')->where('id', $document->id)->update(['slug' => $slug]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }

    private function slugFor(object $document): ?string
    {
        $byStandard = [
            'ISO 45001:2018' => 'iso-45001',
            'ISO 14001:2015' => 'iso-14001',
            'ISO/IEC 27001:2022' => 'iso-27001',
            'ISO 9001:2015' => 'iso-9001',
            'ISO 21500:2012' => 'iso-21500',
            'ISO 41001:2018' => 'iso-41001',
            'ISO 26000:2010' => 'iso-26000',
            'ISO 31000:2018' => 'iso-31000',
        ];

        if (is_string($document->standard_code) && isset($byStandard[$document->standard_code])) {
            return $byStandard[$document->standard_code];
        }

        $title = is_string($document->title) ? json_decode($document->title, true) : $document->title;
        $arabic = is_array($title) ? ($title['ar'] ?? null) : null;
        $byTitle = [
            'شهادة التصنيف (الدرجة الأولى)' => 'classification-certificate',
            'السجل التجاري' => 'commercial-registration',
            'ترخيص مزاولة المهنة' => 'professional-licence',
            'رخصة نشاط تجاري' => 'commercial-activity-licence',
            'ترخيص الدفاع المدني' => 'civil-defence-licence',
        ];

        return is_string($arabic) ? ($byTitle[$arabic] ?? null) : null;
    }
};

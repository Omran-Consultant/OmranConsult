<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('inquiries:prune')->daily();
Schedule::command('audit:prune')->daily();
Schedule::command('cms:prune-tokens')->daily();

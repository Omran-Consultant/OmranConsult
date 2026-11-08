<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'revalidation_secret' => env('REVALIDATION_SECRET'),
    'remember_minutes' => 60 * 24 * 14,
];

<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Trusted public-read callers
    |--------------------------------------------------------------------------
    |
    | Comma-separated egress IPs for the production frontend servers. Requests
    | from these addresses bypass the public-read limiter. Empty by default.
    |
    */
    'public_read_trusted_ips' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('PUBLIC_READ_TRUSTED_IPS', '')),
    ))),
];

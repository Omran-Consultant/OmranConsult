<?php

namespace Tests\Support;

use Illuminate\Testing\TestResponse;

trait InteractsWithSanctumSpa
{
    /**
     * @return array<string, string>
     */
    protected function sanctumSpaHeaders(): array
    {
        return [
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ];
    }

    protected function initializeSanctumSpaSession(): TestResponse
    {
        $this->withCredentials();

        return $this->withHeaders($this->sanctumSpaHeaders())
            ->get('/sanctum/csrf-cookie')
            ->assertNoContent()
            ->assertCookie('XSRF-TOKEN');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function postSanctumSpaJson(string $uri, array $data = []): TestResponse
    {
        return $this->withHeaders(array_merge($this->sanctumSpaHeaders(), [
            'X-XSRF-TOKEN' => session()->token(),
        ]))->postJson($uri, $data);
    }
}

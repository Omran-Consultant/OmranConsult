<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Support\Content\PreviewTokenService;
use App\Support\FrontendServerKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreviewTokenLookupController extends Controller
{
    public function __invoke(Request $request, PreviewTokenService $tokens): JsonResponse
    {
        abort_unless(FrontendServerKey::matches($request->header('X-Omran-Frontend-Key')), 401);

        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $row = $tokens->findValid($validated['token']);
        abort_if($row === null, 404, 'Not found.');

        return response()->json([
            'path' => $row->path,
            'subject_type' => $row->subject_type,
            'subject_id' => $row->subject_id,
            'user_id' => $row->user_id,
            'expires_at' => $row->expires_at->toIso8601String(),
        ]);
    }
}

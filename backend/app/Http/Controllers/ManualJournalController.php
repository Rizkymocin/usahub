<?php

namespace App\Http\Controllers;

use App\Services\ManualJournalService;
use Illuminate\Http\Request;
use Exception;

class ManualJournalController extends Controller
{
    public function __construct(
        protected ManualJournalService $service
    ) {}

    /**
     * Create a manual journal entry.
     */
    public function store(Request $request, string $businessPublicId)
    {
        $validated = $request->validate([
            'event_code' => 'required|string',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|max:500',
        ]);

        try {
            $entry = $this->service->create($businessPublicId, $validated, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Jurnal manual berhasil dicatat',
                'data' => $entry
            ], 201);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

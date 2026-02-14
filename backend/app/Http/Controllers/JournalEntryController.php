<?php

namespace App\Http\Controllers;

use App\Repositories\JournalEntryRepository;
use Illuminate\Http\Request;

class JournalEntryController extends Controller
{
    public function __construct(
        private JournalEntryRepository $journalEntryRepository
    ) {}

    /**
     * Get journal entries for a business
     */
    public function index(Request $request, string $businessPublicId)
    {
        try {
            $business = \App\Models\Business::where('public_id', $businessPublicId)->firstOrFail();

            $filters = [
                'event_code' => $request->query('event_code'),
                'source_type' => $request->query('source_type'),
                'date_from' => $request->query('date_from'),
                'date_to' => $request->query('date_to'),
            ];

            $entries = $this->journalEntryRepository->getForBusiness($business->id, $filters);

            return response()->json([
                'success' => true,
                'data' => $entries->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'journal_date' => $entry->journal_date->format('Y-m-d H:i:s'),
                        'event_code' => $entry->event_code,
                        'source_type' => $entry->source_type,
                        'source_id' => $entry->source_id,
                        'description' => $entry->description,
                        'context_json' => $entry->context_json,
                        'created_at' => $entry->created_at->format('Y-m-d H:i:s'),
                        'lines' => $entry->journalLines->map(function ($line) {
                            return [
                                'id' => $line->id,
                                'account_code' => $line->account->code,
                                'account_name' => $line->account->name,
                                'direction' => $line->direction,
                                'amount' => $line->amount,
                                'finance_user_id' => $line->finance_user_id,
                                'finance_user_name' => $line->financeUser?->name,
                                'customer_id' => $line->customer_id,
                                'customer_name' => $line->customer?->name,
                                'channel_type' => $line->channel_type,
                            ];
                        }),
                        'total_debit' => $entry->journalLines->where('direction', 'DEBIT')->sum('amount'),
                        'total_credit' => $entry->journalLines->where('direction', 'CREDIT')->sum('amount'),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single journal entry with details
     */
    public function show(string $businessPublicId, int $entryId)
    {
        try {
            $business = \App\Models\Business::where('public_id', $businessPublicId)->firstOrFail();
            $entry = $this->journalEntryRepository->find($entryId);

            if (!$entry || $entry->business_id !== $business->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Journal entry not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $entry->id,
                    'journal_date' => $entry->journal_date->format('Y-m-d H:i:s'),
                    'event_code' => $entry->event_code,
                    'source_type' => $entry->source_type,
                    'source_id' => $entry->source_id,
                    'description' => $entry->description,
                    'context_json' => $entry->context_json,
                    'created_at' => $entry->created_at->format('Y-m-d H:i:s'),
                    'lines' => $entry->journalLines->map(function ($line) {
                        return [
                            'id' => $line->id,
                            'account_code' => $line->account->code,
                            'account_name' => $line->account->name,
                            'direction' => $line->direction,
                            'amount' => $line->amount,
                            'finance_user_id' => $line->finance_user_id,
                            'finance_user_name' => $line->financeUser?->name,
                            'customer_id' => $line->customer_id,
                            'customer_name' => $line->customer?->name,
                            'channel_type' => $line->channel_type,
                        ];
                    }),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

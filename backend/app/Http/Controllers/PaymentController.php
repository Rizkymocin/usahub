<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PaymentService;
use Exception;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $service
    ) {}

    /**
     * Get pending payments (unpaid or partially paid receivables/payables)
     */
    public function pending(Request $request, string $businessPublicId)
    {
        try {
            $type = $request->query('type'); // 'receivable' or 'payable'
            if (!$type) {
                return response()->json(['success' => false, 'message' => 'Type is required (receivable/payable).'], 400);
            }

            $pending = $this->service->getPendingPayments($businessPublicId, $type);

            return response()->json([
                'success' => true,
                'data' => $pending
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Store a payment for a pending receivable/payable
     */
    public function store(Request $request, string $businessPublicId)
    {
        $validated = $request->validate([
            'payment_date' => 'required|date',
            'type' => 'required|in:receivable,payable',
            'account_code' => 'required|string', // The specific AR/AP account code (e.g. 1030)
            'payment_account_code' => 'required|string', // Kas or Bank code (e.g. 1010, 1020)
            'amount' => 'required|numeric|min:1',
            'reference_key' => 'required|string',
            'description' => 'required|string',
        ]);

        try {
            $entry = $this->service->processPayment($businessPublicId, $validated, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'data' => $entry
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}

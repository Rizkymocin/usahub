<?php

namespace App\Http\Controllers;

use App\Models\VoucherSale;
use App\Models\VoucherSalePayment;
use App\Services\VoucherSalePaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoucherSalePaymentController extends Controller
{
    protected $paymentService;

    public function __construct(VoucherSalePaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Store a newly created payment in storage.
     */
    public function store(Request $request, $businessId, $saleId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'note' => 'nullable|string',
        ]);

        $query = VoucherSale::where('public_id', $saleId);
        if (is_numeric($saleId)) {
            $query->orWhere('id', $saleId);
        }
        $sale = $query->firstOrFail();

        if ($sale->remaining_amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This sale is already fully paid.',
            ], 400);
        }

        if ($request->amount > $sale->remaining_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Payment amount cannot exceed remaining amount.',
            ], 400);
        }

        try {
            $payment = $this->paymentService->recordPayment(
                $sale,
                $request->amount,
                $request->user()->id,
                $request->payment_method,
                $request->note
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully.',
                'data' => $sale->fresh()->load('payments'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payments for a specific sale.
     */
    public function index($businessId, $saleId)
    {
        $query = VoucherSale::where('public_id', $saleId);
        if (is_numeric($saleId)) {
            $query->orWhere('id', $saleId);
        }
        $sale = $query->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $sale->payments()->with('collectedBy')->latest()->get()
        ]);
    }
}

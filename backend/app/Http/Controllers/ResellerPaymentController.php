<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResellerPaymentRequest;
use App\Services\ResellerPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResellerPaymentController extends Controller
{
    protected $service;

    public function __construct(ResellerPaymentService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $payments = $this->service->listPayments($request->tenant_id, $request->business_id);
        return response()->json([
            'success' => true,
            'message' => 'Payments retrieved successfully',
            'data'    => $payments
        ]);
    }

    public function store(ResellerPaymentRequest $request): JsonResponse
    {
        $payment = $this->service->storePayment($request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data'    => $payment
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $payment = $this->service->getPayment($id, $request->tenant_id, $request->business_id);
        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Payment detail retrieved', 'data' => $payment]);
    }

    public function update(ResellerPaymentRequest $request, int $id): JsonResponse
    {
        $updated = $this->service->updatePayment($id, $request->validated(), $request->tenant_id, $request->business_id);
        if (!$updated) {
            return response()->json(['success' => false, 'message' => 'Payment not found or update failed'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Payment updated successfully', 'data' => []]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->service->deletePayment($id, $request->tenant_id, $request->business_id);
        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Payment not found or deletion failed'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Payment deleted successfully', 'data' => []]);
    }
}

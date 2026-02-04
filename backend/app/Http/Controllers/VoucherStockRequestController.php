<?php

namespace App\Http\Controllers;

use App\Services\VoucherStockRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoucherStockRequestController extends Controller
{
    private VoucherStockRequestService $service;

    public function __construct(VoucherStockRequestService $service)
    {
        $this->service = $service;
    }

    /**
     * List all stock requests for a business
     * GET /businesses/{public_id}/stock-requests
     */
    public function index(Request $request, string $businessPublicId): JsonResponse
    {
        try {
            $status = $request->query('status');
            $requests = $this->service->getBusinessRequests($businessPublicId, $request, $status);

            return response()->json([
                'success' => true,
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get stock request detail
     * GET /businesses/{public_id}/stock-requests/{request_id}
     */
    public function show(Request $request, string $businessPublicId, int $requestId): JsonResponse
    {
        try {
            $stockRequest = $this->service->getRequestDetail($businessPublicId, $requestId, $request);

            return response()->json([
                'success' => true,
                'data' => $stockRequest
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Create new stock request (Finance role)
     * POST /businesses/{public_id}/stock-requests
     */
    public function store(Request $request, string $businessPublicId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.voucher_product_id' => 'required|string|exists:isp_voucher_products,public_id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'outlet_id' => 'nullable|string|exists:isp_outlets,public_id',
            'request_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $stockRequest = $this->service->createStockRequest(
                $businessPublicId,
                $request,
                $validator->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Stock request created successfully',
                'data' => $stockRequest
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Approve stock request (Admin role)
     * POST /businesses/{public_id}/stock-requests/{request_id}/approve
     */
    public function approve(Request $request, string $businessPublicId, int $requestId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'process_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $stockRequest = $this->service->approveRequest(
                $businessPublicId,
                $requestId,
                $request,
                $request->input('process_note')
            );

            return response()->json([
                'success' => true,
                'message' => 'Request approved successfully',
                'data' => $stockRequest
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Reject stock request (Admin role)
     * POST /businesses/{public_id}/stock-requests/{request_id}/reject
     */
    public function reject(Request $request, string $businessPublicId, int $requestId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'process_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $stockRequest = $this->service->rejectRequest(
                $businessPublicId,
                $requestId,
                $request,
                $request->input('process_note')
            );

            return response()->json([
                'success' => true,
                'message' => 'Request rejected successfully',
                'data' => $stockRequest
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}

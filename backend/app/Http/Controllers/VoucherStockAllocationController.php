<?php

namespace App\Http\Controllers;

use App\Services\VoucherStockAllocationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VoucherStockAllocationController extends Controller
{
    public function __construct(
        private VoucherStockAllocationService $allocationService
    ) {}

    /**
     * Get all allocations for a business (Admin view)
     * GET /api/businesses/{business}/voucher-allocations
     */
    public function index(string $businessPublicId, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get business
            $business = $this->getBusiness($businessPublicId, $request);
            if (!$business) {
                return response()->json(['error' => 'Business not found'], 404);
            }

            $allocations = $this->allocationService->getBusinessAllocations($business->id);

            return response()->json([
                'data' => $allocations
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get finance user's stock summary
     * GET /api/businesses/{business}/voucher-allocations/my-stock
     */
    public function myStock(string $businessPublicId, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get business
            $business = $this->getBusiness($businessPublicId, $request);
            if (!$business) {
                return response()->json(['error' => 'Business not found'], 404);
            }

            $stockSummary = $this->allocationService->getFinanceStockSummary($user->id);

            return response()->json([
                'data' => $stockSummary
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create manual allocation (Admin only)
     * POST /api/businesses/{business}/voucher-allocations
     */
    public function store(string $businessPublicId, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get business
            $business = $this->getBusiness($businessPublicId, $request);
            if (!$business) {
                return response()->json(['error' => 'Business not found'], 404);
            }

            $validated = $request->validate([
                'allocated_to_user_id' => 'required|integer|exists:users,id',
                'voucher_product_id' => 'required|integer|exists:isp_voucher_products,id',
                'qty_allocated' => 'required|integer|min:1',
                'notes' => 'nullable|string',
            ]);

            $allocationData = [
                'tenant_id' => $business->tenant_id,
                'business_id' => $business->id,
                'allocated_to_user_id' => $validated['allocated_to_user_id'],
                'voucher_product_id' => $validated['voucher_product_id'],
                'qty_allocated' => $validated['qty_allocated'],
                'allocated_by_user_id' => $user->id,
                'notes' => $validated['notes'] ?? null,
            ];

            $allocation = $this->allocationService->createManualAllocation($allocationData);

            return response()->json([
                'message' => 'Allocation created successfully',
                'data' => $allocation
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Close an allocation (Admin only)
     * PATCH /api/businesses/{business}/voucher-allocations/{allocation}/close
     */
    public function close(string $businessPublicId, int $allocationId, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get business
            $business = $this->getBusiness($businessPublicId, $request);
            if (!$business) {
                return response()->json(['error' => 'Business not found'], 404);
            }

            $this->allocationService->closeAllocation($allocationId);

            return response()->json([
                'message' => 'Allocation closed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper method to get business by public_id
     */
    private function getBusiness(string $publicId, Request $request)
    {
        $user = $request->user();
        if (!$user) return null;

        if ($user->tenant) {
            return \App\Models\Business::where('public_id', $publicId)
                ->where('tenant_id', $user->tenant->id)
                ->first();
        }

        return $user->businesses()
            ->where('businesses.public_id', $publicId)
            ->first();
    }
}

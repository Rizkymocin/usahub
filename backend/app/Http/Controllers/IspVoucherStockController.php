<?php

namespace App\Http\Controllers;

use App\Services\IspVoucherStockService;
use Illuminate\Http\Request;

class IspVoucherStockController extends Controller
{
    public function __construct(
        private IspVoucherStockService $stockService
    ) {}

    /**
     * Get all stocks for a business
     * GET /api/businesses/{businessId}/voucher-stocks
     */
    public function index(Request $request, string $businessPublicId)
    {
        try {
            $user = $request->user();

            // Get business through user's businesses (works for both Owner and Admin)
            $business = $user->businesses()->where('businesses.public_id', $businessPublicId)->first();

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business not found or access denied'
                ], 404);
            }

            $stocks = $this->stockService->getBusinessStocks($business->id);

            return response()->json([
                'success' => true,
                'data' => $stocks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stock summary for dashboard
     * GET /api/businesses/{businessId}/voucher-stocks/summary
     */
    public function summary(Request $request, string $businessPublicId)
    {
        try {
            $user = $request->user();

            // Get business through user's businesses (works for both Owner and Admin)
            $business = $user->businesses()->where('businesses.public_id', $businessPublicId)->first();

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business not found or access denied'
                ], 404);
            }

            $summary = $this->stockService->getStockSummary($business->id);

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new stock
     * POST /api/businesses/{businessId}/voucher-stocks
     */
    public function store(Request $request, string $businessPublicId)
    {
        try {
            $user = $request->user();

            // Get business through user's businesses (works for both Owner and Admin)
            $business = $user->businesses()->where('businesses.public_id', $businessPublicId)->first();

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business not found or access denied'
                ], 404);
            }

            $validated = $request->validate([
                'voucher_product_id' => 'required|integer|exists:isp_voucher_products,id',
                'quantity' => 'required|integer|min:1',
                'purchase_price' => 'nullable|numeric|min:0',
                'default_selling_price' => 'required|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
            ]);

            $stockData = [
                'tenant_id' => $business->tenant_id,
                'business_id' => $business->id,
                'voucher_product_id' => $validated['voucher_product_id'],
                'quantity' => $validated['quantity'],
                'purchase_price' => $validated['purchase_price'] ?? null,
                'default_selling_price' => $validated['default_selling_price'],
                'notes' => $validated['notes'] ?? null,
                'created_by_user_id' => $request->user()->id,
            ];

            $stock = $this->stockService->addStock($stockData);

            return response()->json([
                'success' => true,
                'message' => 'Stock added successfully',
                'data' => $stock
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock price
     * PUT /api/businesses/{businessId}/voucher-stocks/{stockId}
     */
    public function update(Request $request, string $businessPublicId, int $stockId)
    {
        try {
            $user = $request->user();

            // Get business through user's businesses (works for both Owner and Admin)
            $business = $user->businesses()->where('businesses.public_id', $businessPublicId)->first();

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business not found or access denied'
                ], 404);
            }

            $validated = $request->validate([
                'default_selling_price' => 'required|numeric|min:0',
            ]);

            $this->stockService->updateStockPrice($stockId, $validated['default_selling_price']);

            return response()->json([
                'success' => true,
                'message' => 'Stock price updated successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete stock
     * DELETE /api/businesses/{businessId}/voucher-stocks/{stockId}
     */
    public function destroy(Request $request, string $businessPublicId, int $stockId)
    {
        try {
            $user = $request->user();

            // Get business through user's businesses (works for both Owner and Admin)
            $business = $user->businesses()->where('businesses.public_id', $businessPublicId)->first();

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business not found or access denied'
                ], 404);
            }

            $this->stockService->deleteStock($stockId);

            return response()->json([
                'success' => true,
                'message' => 'Stock deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

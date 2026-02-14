<?php

namespace App\Http\Controllers;

use App\Services\VoucherSaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherSaleController extends Controller
{
    protected $service;

    public function __construct(VoucherSaleService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $business_public_id): JsonResponse
    {
        $user = $request->user();
        $tenantId = $user->tenant?->id;

        if (!$tenantId) {
            $business = $user->businesses()->where('businesses.public_id', $business_public_id)->first();
            if (!$business) {
                return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
            }
            $tenantId = $business->tenant_id;
        }

        $sales = $this->service->getSalesByBusiness($business_public_id, $tenantId);
        if ($sales === null) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Voucher sales retrieved successfully',
            'data' => $sales
        ]);
    }

    public function show(Request $request, string $business_public_id, string $sale_public_id): JsonResponse
    {
        $user = $request->user();
        $tenantId = $user->tenant?->id;

        if (!$tenantId) {
            $business = $user->businesses()->where('businesses.public_id', $business_public_id)->first();
            if (!$business) {
                return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
            }
            $tenantId = $business->tenant_id;
        }

        $sale = $this->service->getSaleById($sale_public_id, $business_public_id, $tenantId);
        if (!$sale) {
            return response()->json(['success' => false, 'message' => 'Sale not found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sale details retrieved successfully',
            'data' => $sale
        ]);
    }

    public function store(Request $request, string $business_public_id): JsonResponse
    {
        $user = $request->user();
        $tenantId = $user->tenant?->id;

        if (!$tenantId) {
            $business = $user->businesses()->where('businesses.public_id', $business_public_id)->first();
            if (!$business) {
                return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
            }
            $tenantId = $business->tenant_id;
        }

        $validated = $request->validate([
            'channel_type' => 'required|in:outlet,reseller,admin',
            'outlet_id' => 'nullable|exists:isp_outlets,id',
            'reseller_id' => 'nullable|exists:isp_resellers,id',
            'source_type' => 'nullable|in:allocated_stock,own_stock',
            'source_id' => 'nullable|integer',
            'sold_to_type' => 'nullable|in:reseller,outlet,end_user',
            'sold_to_id' => 'nullable|integer',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'nullable|in:cash,partial,credit',
            'paid_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.voucher_product_id' => 'required|exists:isp_voucher_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'is_prepaid' => 'nullable|boolean',
        ]);

        try {
            $sale = $this->service->createSale($validated, $business_public_id, $tenantId, $user->id);
            return response()->json([
                'success' => true,
                'message' => 'Voucher sale created successfully',
                'data' => $sale
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function addPayment(Request $request, string $business_public_id, string $sale_public_id): JsonResponse
    {
        $user = $request->user();
        $tenantId = $user->tenant?->id;

        if (!$tenantId) {
            $business = $user->businesses()->where('businesses.public_id', $business_public_id)->first();
            if (!$business) {
                return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
            }
            $tenantId = $business->tenant_id;
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        try {
            $sale = $this->service->addPayment($sale_public_id, $validated['amount'], $business_public_id, $tenantId);
            return response()->json([
                'success' => true,
                'message' => 'Payment added successfully',
                'data' => $sale
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function pendingDeliveries(Request $request, string $business_public_id): JsonResponse
    {
        $user = $request->user();
        $business = $user->businesses()->where('businesses.public_id', $business_public_id)->first();
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
        }

        $tenantId = $business->tenant_id;
        $sales = $this->service->getPendingDeliveries($business_public_id, $tenantId);

        return response()->json([
            'success' => true,
            'message' => 'Pending deliveries retrieved successfully',
            'data' => $sales
        ]);
    }

    public function markDelivered(Request $request, string $business_public_id, string $sale_public_id): JsonResponse
    {
        $user = $request->user();
        $business = $user->businesses()->where('businesses.public_id', $business_public_id)->first();
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
        }

        $tenantId = $business->tenant_id;

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.voucher_product_id' => 'required|integer',
            'items.*.delivered_qty' => 'required|integer|min:0',
            'delivery_note' => 'nullable|string|max:500',
        ]);

        try {
            $sale = $this->service->markAsDelivered(
                $sale_public_id,
                $business_public_id,
                $tenantId,
                $user->id,
                $validated['items'],
                $validated['delivery_note'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Sale marked as delivered successfully',
                'data' => $sale
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}

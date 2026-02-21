<?php

namespace App\Http\Controllers;

use App\Services\IspPurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IspPurchaseController extends Controller
{
    protected $service;

    public function __construct(IspPurchaseService $service)
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

        $purchases = $this->service->getPurchasesByBusiness($business_public_id, $tenantId);
        if ($purchases === null) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Purchases retrieved successfully',
            'data' => $purchases
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
            'purchase_date' => 'required|date',
            'type' => 'required|string|in:maintenance,general',
            'payment_method' => 'nullable|string|in:cash,credit,transfer', // Default to cash if null
            'invoice_number' => 'nullable|string|max:255',
            'supplier_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.isp_maintenance_item_id' => 'nullable|exists:isp_maintenance_items,id',
        ]);

        try {
            $purchase = $this->service->createPurchase($validated, $business_public_id, $tenantId, $user->id);
            return response()->json([
                'success' => true,
                'message' => 'Purchase created successfully',
                'data' => $purchase
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\IspVoucherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IspVoucherController extends Controller
{
    private IspVoucherService $service;

    public function __construct(IspVoucherService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $businessPublicId): JsonResponse
    {
        $products = $this->service->getBusinessVoucherProducts($businessPublicId, $request);

        if ($products === null) {
            return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
        }

        $products->makeVisible(['id']);

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function store(Request $request, string $businessPublicId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'duration_value' => 'required|integer|min:1',
            'duration_unit' => 'required|in:hour,day,month',
            'selling_price' => 'required|numeric|min:0',
            'owner_share' => 'required|numeric|min:0',
            'reseller_fee' => 'required|numeric|min:0',
        ]);

        try {
            $product = $this->service->createVoucherProduct($businessPublicId, $request, $validated);
            return response()->json(['success' => true, 'data' => $product], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
    public function destroy(Request $request, string $businessPublicId, string $voucherPublicId): JsonResponse
    {
        try {
            $this->service->deleteVoucherProduct($businessPublicId, $request, $voucherPublicId);
            return response()->json(['success' => true, 'message' => 'Voucher product deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

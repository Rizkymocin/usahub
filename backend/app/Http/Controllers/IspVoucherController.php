<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\IspVoucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class IspVoucherController extends Controller
{
    private function resolveTenantId(Request $request, string $businessPublicId): ?int
    {
        $user = $request->user();
        if ($user->tenant) {
            return $user->tenant->id;
        }
        $business = $user->businesses()->where('public_id', $businessPublicId)->first();
        return $business ? $business->tenant_id : null;
    }

    private function getBusiness(string $publicId, int $tenantId): ?Business
    {
        return Business::where('public_id', $publicId)->where('tenant_id', $tenantId)->first();
    }

    public function index(Request $request, string $businessPublicId): JsonResponse
    {
        $tenantId = $this->resolveTenantId($request, $businessPublicId);
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
        }

        $business = $this->getBusiness($businessPublicId, $tenantId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $vouchers = IspVoucher::where('business_id', $business->id)->get(); // Assuming business_id exists

        return response()->json(['success' => true, 'data' => $vouchers]);
    }

    public function store(Request $request, string $businessPublicId): JsonResponse
    {
        $tenantId = $this->resolveTenantId($request, $businessPublicId);
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
        }

        $business = $this->getBusiness($businessPublicId, $tenantId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'code' => 'required|string|unique:isp_vouchers,code',
            'price' => 'required|numeric',
            // 'voucher_id' ? user mentioned 'voucherd_id' from external API
            'voucher_id' => 'nullable|string',
        ]);

        $voucher = IspVoucher::create([
            'business_id' => $business->id,
            'code' => $validated['code'],
            'price' => $validated['price'],
            'voucher_id' => $validated['voucher_id'] ?? Str::random(10), // Placeholder
            'status' => 'active', // default
        ]);

        return response()->json(['success' => true, 'data' => $voucher], 201);
    }
}

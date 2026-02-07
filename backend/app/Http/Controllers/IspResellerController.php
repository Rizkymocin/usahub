<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\IspResellerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IspResellerController extends Controller
{
    protected $resellerService;

    public function __construct(IspResellerService $resellerService)
    {
        $this->resellerService = $resellerService;
    }

    private function getBusiness(Request $request, string $publicId): ?Business
    {
        $user = $request->user();
        return $user->businesses()->where('businesses.public_id', $publicId)->first();
    }

    public function index(Request $request, string $businessPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $resellers = $this->resellerService->getBusinessResellers($business->id);

        return response()->json([
            'success' => true,
            'data' => $resellers
        ]);
    }

    public function getActive(Request $request, string $businessPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $resellers = $this->resellerService->getActiveResellers($business->id);

        return response()->json([
            'success' => true,
            'data' => $resellers
        ]);
    }

    public function getInactive(Request $request, string $businessPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $resellers = $this->resellerService->getInactiveResellers($business->id);

        return response()->json([
            'success' => true,
            'data' => $resellers
        ]);
    }

    public function store(Request $request, string $businessPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'outlet_id' => 'nullable|exists:isp_outlets,id', // Optional, will infer if null
        ]);

        try {
            $reseller = $this->resellerService->registerReseller($business, $validated, $request->user()->id);
            return response()->json(['success' => true, 'data' => $reseller], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function activate(Request $request, string $businessPublicId, string $resellerCode): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        try {
            $result = $this->resellerService->activateReseller($resellerCode, $business->tenant_id);
            if ($result) {
                return response()->json(['success' => true, 'message' => 'Reseller activated successfully']);
            }
            return response()->json(['success' => false, 'message' => 'Failed to activate reseller'], 400);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\IspOutletRequest;
use App\Http\Requests\IspOutletTopupRequest;
use App\Models\Business;
use App\Services\IspOutletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IspOutletController extends Controller
{
    private $service;

    public function __construct(IspOutletService $service)
    {
        $this->service = $service;
    }

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

        $outlets = $this->service->listOutlets($tenantId, $business->id);

        return response()->json(['success' => true, 'data' => $outlets]);
    }

    public function store(IspOutletRequest $request, string $businessPublicId): JsonResponse
    {
        $tenantId = $this->resolveTenantId($request, $businessPublicId);
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
        }

        $business = $this->getBusiness($businessPublicId, $tenantId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        try {
            $outlet = $this->service->createOutlet($request->validated(), $tenantId, $business->id);
            return response()->json(['success' => true, 'data' => $outlet], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

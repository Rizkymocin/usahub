<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessRequest;
use App\Services\BusinessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    protected $service;

    public function __construct(BusinessService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'User does not have a tenant',
            ], 404);
        }

        $businesses = $this->service->listBusinesses($tenant->id);
        return response()->json([
            'success' => true,
            'message' => 'Businesses retrieved successfully',
            'data'    => $businesses
        ]);
    }

    public function store(BusinessRequest $request): JsonResponse
    {
        try {
            $business = $this->service->createBusiness($request->validated(), $request->user()->tenant->id);
            return response()->json([
                'success' => true,
                'message' => 'Business created successfully',
                'data'    => $business
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show(Request $request, string $public_id): JsonResponse
    {
        $tenant = $request->user()->tenant;
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'User does not have a tenant'], 404);
        }

        $business = $this->service->getBusinessByPublicId($public_id, $tenant->id);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Business detail retrieved', 'data' => $business]);
    }

    public function update(BusinessRequest $request, string $public_id): JsonResponse
    {
        $tenant = $request->user()->tenant;
        try {
            $updated = $this->service->updateBusiness($public_id, $tenant->id, $request->validated());
            if (!$updated) {
                return response()->json(['success' => false, 'message' => 'Business not found or update failed'], 404);
            }
            return response()->json(['success' => true, 'message' => 'Business updated successfully', 'data' => []]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function users(Request $request, string $business_public_id): JsonResponse
    {
        $tenant = $request->user()->tenant;
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'User does not have a tenant'], 404);
        }

        $users = $this->service->getBusinessUsers($business_public_id, $tenant->id);
        if (!$users) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Business users retrieved successfully', 'data' => $users]);
    }

    public function storeUser(Request $request, string $business_public_id): JsonResponse
    {
        $tenant = $request->user()->tenant;
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'User does not have a tenant'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'role' => 'required|string'
        ]);

        try {
            $user = $this->service->createBusinessUser($validated, $business_public_id, $tenant->id);
            return response()->json([
                'success' => true,
                'message' => 'User added successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->service->deleteBusiness($id, $request->tenant_id);
        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Business not found or deletion failed'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Business deleted successfully', 'data' => []]);
    }
}

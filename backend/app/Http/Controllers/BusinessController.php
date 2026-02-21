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
        $user = $request->user();
        $tenant = $user->tenant;

        // If user is Owner (has tenant), list all businesses for that tenant
        if ($tenant) {
            $businesses = $this->service->listBusinesses($tenant->id);
            return response()->json([
                'success' => true,
                'message' => 'Businesses retrieved successfully',
                'data'    => $businesses,
                'meta'    => [
                    'max_business' => $tenant->plan ? $tenant->plan->max_business : 1,
                    'current_count' => $businesses->count()
                ]
            ]);
        }

        // If user is not Owner (Business Admin / Employee), list assigned businesses
        $businesses = $this->service->getBusinessesForUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Assigned businesses retrieved successfully',
            'data'    => $businesses
        ]);
    }

    public function getBusinessesByAdmin(Request $request): JsonResponse
    {
        $user = $request->user();
        $businesses = $this->service->getBusinessesForUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Assigned businesses retrieved successfully',
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
        $user = $request->user();
        $tenantId = $user->tenant?->id;

        if (!$tenantId) {
            $business = $user->businesses()->where('businesses.public_id', $public_id)->first();
            if (!$business) {
                return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
            }
            $tenantId = $business->tenant_id;
        }

        $business = $this->service->getBusinessByPublicId($public_id, $tenantId);
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
        $user = $request->user();
        $tenantId = $user->tenant?->id;

        if (!$tenantId) {
            $business = $user->businesses()->where('businesses.public_id', $business_public_id)->first();
            if (!$business) {
                return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
            }
            $tenantId = $business->tenant_id;
        }

        $role = $request->query('role');
        $users = $this->service->getBusinessUsers($business_public_id, $tenantId, $role);
        if (!$users) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Business users retrieved successfully', 'data' => $users]);
    }

    public function storeUser(Request $request, string $business_public_id): JsonResponse
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
            'name' => 'required|string',
            'email' => 'required|email',
            'role' => 'required|array', // Enforce array or handle string conversion
            'role.*' => 'string'
        ]);

        try {
            $user = $this->service->createBusinessUser($validated, $business_public_id, $tenantId);
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

    public function outlets(Request $request, string $business_public_id): JsonResponse
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

        $outlets = $this->service->getBusinessOutlets($business_public_id, $tenantId);
        if (!$outlets) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Business outlets retrieved successfully', 'data' => $outlets]);
    }

    public function storeOutlet(Request $request, string $business_public_id): JsonResponse
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
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'role' => 'nullable|string'
        ]);

        try {
            $outlet = $this->service->createBusinessOutlet($validated, $business_public_id, $tenantId);
            return response()->json([
                'success' => true,
                'message' => 'Outlet added successfully',
                'data' => $outlet
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function updateOutlet(Request $request, string $business_public_id, string $outlet_public_id): JsonResponse
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
            'name' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'nullable|boolean'
        ]);

        try {
            $updated = $this->service->updateBusinessOutlet($business_public_id, $outlet_public_id, $tenantId, $validated);
            if (!$updated) {
                return response()->json(['success' => false, 'message' => 'Outlet not found or update failed'], 404);
            }
            return response()->json(['success' => true, 'message' => 'Outlet updated successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroyOutlet(Request $request, string $business_public_id, string $outlet_public_id): JsonResponse
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

        try {
            $deleted = $this->service->deleteBusinessOutlet($business_public_id, $outlet_public_id, $tenantId);
            if (!$deleted) {
                return response()->json(['success' => false, 'message' => 'Outlet not found or deletion failed'], 404);
            }
            return response()->json(['success' => true, 'message' => 'Outlet deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function resellers(Request $request, string $business_public_id): JsonResponse
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

        $resellers = $this->service->getBusinessResellers($business_public_id, $tenantId);
        if (!$resellers) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Business resellers retrieved successfully', 'data' => $resellers]);
    }

    public function storeReseller(Request $request, string $business_public_id): JsonResponse
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
            'outlet_id' => 'sometimes|exists:isp_outlets,id', // Keep for backward compatibility if needed, or remove? Better remove to force usage of public_id? Or allow both?
            'outlet_public_id' => 'required_without:outlet_id|exists:isp_outlets,public_id',
            'name' => 'required|string',
            'phone' => 'required|string',
            'address' => 'nullable|string',
            'ip_address' => 'nullable|ip',
            'cidr' => 'nullable|integer|between:0,32',
        ]);

        try {
            $reseller = $this->service->createBusinessReseller($validated, $business_public_id, $tenantId, $user->id);
            return response()->json([
                'success' => true,
                'message' => 'Reseller added successfully',
                'data' => $reseller
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function updateReseller(Request $request, string $business_public_id, string $reseller_code): JsonResponse
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
            'is_active' => 'boolean',
            'name' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'outlet_public_id' => 'nullable|exists:isp_outlets,public_id',
        ]);

        try {
            $updated = $this->service->updateBusinessReseller($business_public_id, $reseller_code, $tenantId, $validated);
            if (!$updated) {
                return response()->json(['success' => false, 'message' => 'Reseller not found or update failed'], 404);
            }
            return response()->json(['success' => true, 'message' => 'Reseller updated successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroyReseller(Request $request, string $business_public_id, string $reseller_code): JsonResponse
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

        try {
            $deleted = $this->service->deleteBusinessReseller($business_public_id, $reseller_code, $tenantId);
            if (!$deleted) {
                return response()->json(['success' => false, 'message' => 'Reseller not found or deletion failed'], 404);
            }
            return response()->json(['success' => true, 'message' => 'Reseller deleted successfully']);
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

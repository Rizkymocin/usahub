<?php

namespace App\Http\Controllers;

use App\Http\Requests\TenantRequest;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    protected $service;

    public function __construct(TenantService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $tenants = $this->service->listTenants();
        return response()->json([
            'success' => true,
            'message' => 'Tenants retrieved successfully',
            'data'    => $tenants
        ]);
    }

    public function store(TenantRequest $request): JsonResponse
    {
        $tenant = $this->service->createTenant($request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Tenant created successfully',
            'data'    => $tenant
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tenant = $this->service->getTenant($id);
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Tenant detail retrieved', 'data' => $tenant]);
    }

    public function update(TenantRequest $request, int $id): JsonResponse
    {
        $updated = $this->service->updateTenant($id, $request->validated());
        if (!$updated) {
            return response()->json(['success' => false, 'message' => 'Tenant not found or update failed'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Tenant updated successfully', 'data' => []]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->service->deleteTenant($id);
        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Tenant not found or deletion failed'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Tenant deleted successfully', 'data' => []]);
    }
}

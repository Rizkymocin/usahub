<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AccountService;
use App\Services\BusinessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    protected $service;
    protected $businessService;

    public function __construct(AccountService $service, BusinessService $businessService)
    {
        $this->service = $service;
        $this->businessService = $businessService;
    }

    public function index(Request $request, string $businessPublicId): JsonResponse
    {
        $tenantId = $request->user()->tenant->id;
        $business = $this->businessService->repository->findByIdPublicId($businessPublicId, $tenantId);

        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $accounts = $this->service->getBusinessAccounts($business->id);

        // Transform to tree if needed, or send flat list. 
        // For simplicity now, let's send flat list, frontend can build tree.
        return response()->json([
            'success' => true,
            'message' => 'Accounts retrieved successfully',
            'data'    => $accounts
        ]);
    }

    public function store(Request $request, string $businessPublicId): JsonResponse
    {
        $tenantId = $request->user()->tenant->id;
        $business = $this->businessService->repository->findByIdPublicId($businessPublicId, $tenantId);

        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                Rule::unique('accounts')->where(function ($query) use ($business) {
                    return $query->where('business_id', $business->id);
                })
            ],
            'parent_id' => 'required|exists:accounts,id', // Must be a sub-account for now
        ]);

        try {
            $account = $this->service->createAccount($validated, $business->id, $tenantId);
            return response()->json([
                'success' => true,
                'message' => 'Account created successfully',
                'data'    => $account
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy(Request $request, string $businessPublicId, int $id): JsonResponse
    {
        $tenantId = $request->user()->tenant->id;
        $business = $this->businessService->repository->findByIdPublicId($businessPublicId, $tenantId);

        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        try {
            $this->service->deleteAccount($id, $business->id, $tenantId);
            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully',
                'data'    => []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}

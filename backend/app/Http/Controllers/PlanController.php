<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlanRequest;
use App\Services\PlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    protected $service;

    public function __construct(PlanService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        $plans = $this->service->listPlans();
        return response()->json([
            'success' => true,
            'message' => 'Plans retrieved successfully',
            'data'    => $plans
        ]);
    }

    public function store(PlanRequest $request): JsonResponse
    {
        $plan = $this->service->createPlan($request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Plan created successfully',
            'data'    => $plan
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $plan = $this->service->getPlan($id);
        if (!$plan) {
            return response()->json(['success' => false, 'message' => 'Plan not found'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Plan detail retrieved', 'data' => $plan]);
    }

    public function update(PlanRequest $request, int $id): JsonResponse
    {
        $updated = $this->service->updatePlan($id, $request->validated());
        if (!$updated) {
            return response()->json(['success' => false, 'message' => 'Plan not found or update failed'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Plan updated successfully', 'data' => []]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->service->deletePlan($id);
        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Plan not found or deletion failed'], 404);
        }
        return response()->json(['success' => true, 'message' => 'Plan deleted successfully', 'data' => []]);
    }
}

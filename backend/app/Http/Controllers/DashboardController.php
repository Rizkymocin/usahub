<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Models\Business;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get aggregate dashboard for the Tenant Owner.
     */
    public function getOwnerDashboard(Request $request)
    {
        $user = $request->user();

        // Owner logic: We need their tenant ID and all businesses they own.
        // Assuming Owner has a relationship to Tenant or owns via business_users pivot.
        // Or if $user is the owner, $user->tenant exists.

        $tenant = $user->tenant;

        if (!$tenant) {
            // Fallback: mostly handling cases where user might just be assigned as super_admin everywhere
            // but let's assume they have a tenant for the owner role
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found for user.'
            ], 403);
        }

        $businessIds = $tenant->businesses()->pluck('id')->toArray();

        $data = $this->dashboardService->getOwnerDashboardData($tenant->id, $businessIds);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get specific business dashboard for Business Admin.
     */
    public function getBusinessDashboard(Request $request, string $public_id)
    {
        $business = Business::where('public_id', $public_id)->firstOrFail();

        // Add authorization check here if needed: Ensure user belongs to business

        $data = $this->dashboardService->getBusinessDashboardData($business->id);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}

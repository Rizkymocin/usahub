<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Services\IspProspectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IspProspectController extends Controller
{
    protected $prospectService;

    public function __construct(IspProspectService $prospectService)
    {
        $this->prospectService = $prospectService;
    }

    private function getBusiness(Request $request, string $publicId): ?Business
    {
        $user = $request->user();

        // Allow teknisi to access any business by public_id
        if ($user->hasAnyRole(['teknisi_pasang_baru', 'teknisi_maintenance'])) {
            return Business::where('public_id', $publicId)->first();
        }

        // For other users, check if they're associated with the business
        return $user->businesses()->where('businesses.public_id', $publicId)->first();
    }

    /**
     * List prospects for a business (admin) or for the authenticated sales user (mobile).
     */
    public function index(Request $request, string $businessPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $filters = $request->only(['status', 'sales_id']);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Non-admin/technician users only see their own prospects
        if (!$user->hasAnyRole(['superadmin', 'owner', 'business_admin', 'admin', 'teknisi_pasang_baru', 'teknisi_maintenance'])) {
            $filters['sales_id'] = $user->id;
        }

        $prospects = $this->prospectService->getByBusiness($business->id, $filters);

        return response()->json([
            'success' => true,
            'data' => $prospects,
        ]);
    }

    /**
     * Get prospects registered by the authenticated sales user (for mobile).
     */
    public function myProspects(Request $request): JsonResponse
    {
        $prospects = $this->prospectService->getBySales(Auth::id());

        return response()->json([
            'success' => true,
            'data' => $prospects,
        ]);
    }

    /**
     * Sales registers a new prospect.
     */
    public function store(Request $request, string $businessPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'outlet_id' => 'nullable|exists:isp_outlets,id',
            'outlet_public_id' => 'nullable|exists:isp_outlets,public_id',
        ]);

        try {
            $prospect = $this->prospectService->register($business, $validated, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Prospect registered successfully',
                'data' => $prospect,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get prospect detail.
     */
    public function show(Request $request, string $businessPublicId, string $prospectPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $prospect = $this->prospectService->getByPublicId($prospectPublicId);
        if (!$prospect || $prospect->business_id !== $business->id) {
            return response()->json(['success' => false, 'message' => 'Prospect not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $prospect,
        ]);
    }

    /**
     * Admin approves a prospect.
     */
    public function approve(Request $request, string $businessPublicId, string $prospectPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'note' => 'nullable|string',
            'commission_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            $prospect = $this->prospectService->approve(
                $prospectPublicId,
                $request->user()->id,
                $validated['note'] ?? null,
                $validated['commission_amount'] ?? 0
            );
            return response()->json([
                'success' => true,
                'message' => 'Prospect approved successfully',
                'data' => $prospect,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin rejects a prospect.
     */
    public function reject(Request $request, string $businessPublicId, string $prospectPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        try {
            $prospect = $this->prospectService->reject($prospectPublicId, $request->user()->id, $validated['note']);
            return response()->json([
                'success' => true,
                'message' => 'Prospect rejected',
                'data' => $prospect,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin re-approves a prospect after teknisi rejection.
     */
    public function reApprove(Request $request, string $businessPublicId, string $prospectPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'note' => 'nullable|string',
        ]);

        try {
            $prospect = $this->prospectService->reApprove($prospectPublicId, $request->user()->id, $validated['note'] ?? null);
            return response()->json([
                'success' => true,
                'message' => 'Prospect re-approved successfully',
                'data' => $prospect,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin activates a prospect (creates reseller, finalizes flow).
     */
    public function activate(Request $request, string $businessPublicId, string $prospectPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        try {
            $prospect = $this->prospectService->activate($prospectPublicId, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Prospect activated as reseller successfully',
                'data' => $prospect,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Teknisi confirms readiness for an approved prospect.
     */
    public function confirmReadiness(Request $request, string $businessPublicId, string $prospectPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        try {
            $prospect = $this->prospectService->confirmReadiness($prospectPublicId, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Kesiapan berhasil dikonfirmasi',
                'data' => $prospect,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin assigns a technician from confirmed readiness list.
     */
    public function assignTechnician(Request $request, string $businessPublicId, string $prospectPublicId): JsonResponse
    {
        $business = $this->getBusiness($request, $businessPublicId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'technician_user_id' => 'required|exists:users,id',
        ]);

        try {
            $prospect = $this->prospectService->assignTechnician(
                $prospectPublicId,
                $request->user()->id,
                $validated['technician_user_id']
            );
            return response()->json([
                'success' => true,
                'message' => 'Teknisi berhasil ditugaskan',
                'data' => $prospect,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

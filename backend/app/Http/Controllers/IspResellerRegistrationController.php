<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IspResellerRegistration;
use App\Services\IspResellerService;
use Illuminate\Support\Facades\Auth;

class IspResellerRegistrationController extends Controller
{
    protected $resellerService;

    public function __construct(IspResellerService $resellerService)
    {
        $this->resellerService = $resellerService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        $registrations = IspResellerRegistration::with(['reseller', 'business'])
            ->where('sales_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($registrations);
    }

    /**
     * Approve a reseller registration
     */
    public function approve(Request $request, $registrationId)
    {
        $validated = $request->validate([
            'commission_amount' => 'required|numeric|min:0',
        ]);

        try {
            $registration = $this->resellerService->approveRegistration(
                $registrationId,
                $validated['commission_amount'],
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Registration approved successfully',
                'data' => $registration->load(['reseller', 'business', 'sales']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

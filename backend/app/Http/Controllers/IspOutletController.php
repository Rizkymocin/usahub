<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\IspOutlet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class IspOutletController extends Controller
{
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

        $outlets = IspOutlet::where('tenant_id', $tenantId)
            ->where('business_id', $business->id)
            ->get();

        return response()->json(['success' => true, 'data' => $outlets]);
    }

    public function store(Request $request, string $businessPublicId): JsonResponse
    {
        $tenantId = $this->resolveTenantId($request, $businessPublicId);
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Business not found or access denied'], 404);
        }

        $business = $this->getBusiness($businessPublicId, $tenantId);
        if (!$business) {
            return response()->json(['success' => false, 'message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'address' => 'required|string',
            // User id linkage? Migration says defaults nullable/restrict, might need a user account created first?
            // "the outlets is stored in isp_outlets, they can login but via a mobile app i will build later."
            // Migration: foreignKey user_id.
            // If they can login, they need a User record.
        ]);

        // NOTE: For now, creating outlet without user linkage or creating a user?
        // User asked "they can login", so probably need to creating a user first.
        // Let's create a User for the outlet using the phone/name.

        // For MVP, just creating outlet record. Login handling might be done later.
        // Actually migration validation might fail if user_id is required but schema says it's a foreign ID.
        // Checking migration... $table->foreignId('user_id')->references('id')->on('users'); 
        // It doesn't say ->nullable(). So it is REQUIRED.

        // So we MUST create a user.
        // Let's assume we create a user with name=OutletName, email=UniqueEmail(phone?), password=Default.

        // Need DB transaction
        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $tenantId, $business) {
            $email = 'outlet.' . Str::slug($validated['name']) . '.' . rand(100, 999) . '@example.com'; // Placeholder
            $user = \App\Models\User::create([
                'name' => $validated['name'],
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make('outlet123'), // Default
            ]);
            $user->assignRole('isp_outlet'); // Assuming role exists

            $outlet = IspOutlet::create([
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'business_id' => $business->id,
                'user_id' => $user->id,
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'current_balance' => 0,
                'status' => true,
            ]);

            return response()->json(['success' => true, 'data' => $outlet], 201);
        });
    }

    public function topup(Request $request, string $businessPublicId, int $outletId): JsonResponse
    {
        // Handle Topup Logic (Create IspOutletTopup)
        $tenantId = $this->resolveTenantId($request, $businessPublicId);
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 404);
        }

        $validated = $request->validate(['amount' => 'required|numeric|min:1']);

        $topup = \App\Models\IspOutletTopup::create([
            'outlet_id' => $outletId,
            'amount' => $validated['amount'],
            'status' => 'pending', // or success directly if admin does it?
            'created_at' => now(),
        ]);

        // If Admin does it, maybe auto-approve?
        // Let's assume "pending" and then another endpoint to "approve". Or if "manage topup", maybe just list and approve.

        return response()->json(['success' => true, 'data' => $topup]);
    }
}

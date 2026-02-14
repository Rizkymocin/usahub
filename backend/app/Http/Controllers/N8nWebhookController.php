<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\IspProspect;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class N8nWebhookController extends Controller
{
    /**
     * Returns prospect data + list of all teknisi in the business.
     * Called by n8n after admin approves a prospect, to send WhatsApp notifications.
     */
    public function prospectApproved(string $prospectPublicId): JsonResponse
    {
        $prospect = IspProspect::where('public_id', $prospectPublicId)
            ->with(['business', 'sales'])
            ->first();

        if (!$prospect) {
            return response()->json(['success' => false, 'message' => 'Prospect not found'], 404);
        }

        // Get all teknisi in this business
        $teknisiUsers = User::whereHas('businesses', function ($q) use ($prospect) {
            $q->where('businesses.id', $prospect->business_id);
        })->whereHas('roles', function ($q) {
            $q->where('name', 'isp_teknisi');
        })->select('id', 'name', 'email', 'phone')->get();

        return response()->json([
            'success' => true,
            'event' => 'prospect_approved',
            'prospect' => [
                'public_id' => $prospect->public_id,
                'name' => $prospect->name,
                'phone' => $prospect->phone,
                'address' => $prospect->address,
                'status' => $prospect->status,
                'approved_at' => $prospect->approved_at,
            ],
            'business' => [
                'id' => $prospect->business->id,
                'name' => $prospect->business->name,
            ],
            'sales' => $prospect->sales ? [
                'name' => $prospect->sales->name,
                'phone' => $prospect->sales->phone ?? null,
            ] : null,
            'teknisi_list' => $teknisiUsers->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'phone' => $u->phone ?? null,
            ]),
        ]);
    }

    /**
     * Returns prospect data + assigned technician + all confirmed teknisi.
     * Called by n8n after admin assigns a technician, to send WhatsApp notifications.
     */
    public function technicianAssigned(string $prospectPublicId): JsonResponse
    {
        $prospect = IspProspect::where('public_id', $prospectPublicId)
            ->with(['business', 'assignedTechnician', 'readinessConfirmations.user'])
            ->first();

        if (!$prospect) {
            return response()->json(['success' => false, 'message' => 'Prospect not found'], 404);
        }

        if (!$prospect->assigned_technician_id) {
            return response()->json(['success' => false, 'message' => 'No technician assigned yet'], 400);
        }

        return response()->json([
            'success' => true,
            'event' => 'technician_assigned',
            'prospect' => [
                'public_id' => $prospect->public_id,
                'name' => $prospect->name,
                'phone' => $prospect->phone,
                'address' => $prospect->address,
                'status' => $prospect->status,
            ],
            'business' => [
                'id' => $prospect->business->id,
                'name' => $prospect->business->name,
            ],
            'assigned_technician' => [
                'id' => $prospect->assignedTechnician->id,
                'name' => $prospect->assignedTechnician->name,
                'phone' => $prospect->assignedTechnician->phone ?? null,
            ],
            'all_confirmed_teknisi' => $prospect->readinessConfirmations->map(fn($r) => [
                'id' => $r->user->id,
                'name' => $r->user->name,
                'phone' => $r->user->phone ?? null,
                'confirmed_at' => $r->confirmed_at,
            ]),
        ]);
    }
}

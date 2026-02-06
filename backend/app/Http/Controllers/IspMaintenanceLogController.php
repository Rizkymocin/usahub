<?php

namespace App\Http\Controllers;

use App\Services\IspMaintenanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IspMaintenanceLogController extends Controller
{
    protected $service;

    public function __construct(IspMaintenanceService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request, $public_id, $issue_public_id)
    {
        $validated = $request->validate([
            'action_taken' => 'required|string',
            'result' => 'required|in:success,pending,failed',
            'notes' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'image|max:10240', // Max 10MB per photo
            'items' => 'nullable|array',
            'items.*.item_id' => 'required_with:items|exists:isp_maintenance_items,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        $log = $this->service->logActivity($public_id, $issue_public_id, Auth::id(), $validated);

        return response()->json($log, 201);
    }
}

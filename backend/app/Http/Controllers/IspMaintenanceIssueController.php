<?php

namespace App\Http\Controllers;

use App\Services\IspMaintenanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IspMaintenanceIssueController extends Controller
{
    protected $service;

    public function __construct(IspMaintenanceService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, $public_id)
    {
        $issues = $this->service->getBusinessIssues($public_id, $request->all());
        return response()->json($issues);
    }

    public function store(Request $request, $public_id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'reseller_id' => 'required|integer', // Service expects ID, validation ensures exists
            'priority' => 'required|in:low,medium,high,critical',
            'description' => 'nullable|string',
        ]);

        $issue = $this->service->createIssue($public_id, Auth::id(), $request->all());

        return response()->json($issue->load(['reseller']), 201);
    }

    public function show($public_id, $issue_public_id)
    {
        $issue = $this->service->getIssueDetail($public_id, $issue_public_id);
        return response()->json($issue->load(['reseller', 'assignedTechnician', 'reporter', 'logs.technician']));
    }

    public function update(Request $request, $public_id, $issue_public_id)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,assigned,in_progress,resolved,closed',
            'assigned_technician_id' => 'sometimes|exists:users,id',
        ]);

        $issue = $this->service->updateIssue($public_id, $issue_public_id, $validated);

        return response()->json($issue);
    }

    public function items(Request $request, $public_id)
    {
        $items = $this->service->getInventoryItems($public_id);
        return response()->json($items);
    }

    public function storeItem(Request $request, $public_id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'stock' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
        ]);

        $item = $this->service->createInventoryItem($public_id, $validated);
        return response()->json($item, 201);
    }
}

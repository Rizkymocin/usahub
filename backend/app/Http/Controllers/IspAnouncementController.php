<?php

namespace App\Http\Controllers;

use App\Services\IspAnouncementService;
use Illuminate\Http\Request;

class IspAnouncementController extends Controller
{

    private $service;

    public function __construct(IspAnouncementService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $businessPublicId)
    {
        $tenantId = $request->user()->tenant_id ?? null;
        $anouncements = $this->service->getAnouncements($businessPublicId, $tenantId);
        return response()->json($anouncements);
    }

    public function store(Request $request, string $businessPublicId)
    {
        $tenantId = $request->user()->tenant_id ?? null;
        $data = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'type' => 'required|in:info,penting',
            'status' => 'required|in:active,inactive',
        ]);

        $anouncement = $this->service->createAnouncement($businessPublicId, $tenantId, $data);
        return response()->json($anouncement, 201);
    }

    public function update(Request $request, string $businessPublicId, int $id)
    {
        $tenantId = $request->user()->tenant_id ?? null;
        $data = $request->validate([
            'title' => 'string',
            'content' => 'string',
            'type' => 'in:info,penting',
            'status' => 'in:active,inactive',
        ]);

        $anouncement = $this->service->updateAnouncement($businessPublicId, $tenantId, $id, $data);
        return response()->json($anouncement);
    }

    public function destroy(Request $request, string $businessPublicId, int $id)
    {
        $tenantId = $request->user()->tenant_id ?? null;
        $this->service->deleteAnouncement($businessPublicId, $tenantId, $id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}

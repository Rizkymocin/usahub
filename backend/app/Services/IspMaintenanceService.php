<?php

namespace App\Services;

use App\Models\Business;
use App\Models\IspMaintenanceIssue;
use App\Models\IspReseller;
use App\Repositories\IspMaintenanceRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class IspMaintenanceService
{
    protected $repository;

    public function __construct(IspMaintenanceRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getBusinessIssues(string $businessPublicId, array $filters = []): Collection
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if ($user && !$user->hasAnyRole(['superadmin', 'owner', 'business_admin', 'admin'])) {
            $filters['technician_isolation_id'] = $user->id;
        }

        return $this->repository->getIssuesByBusinessId($business->id, $filters)
            ->load(['logs.technician', 'logs.items']);
    }

    public function createIssue(string $businessPublicId, int $reporterId, array $data): IspMaintenanceIssue
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();
        $reseller = IspReseller::findOrFail($data['reseller_id']); // Assuming ID is passed, need validation if it's public_id

        return $this->repository->createIssue([
            'business_id' => $business->id,
            'reseller_id' => $reseller->id,
            'reporter_id' => $reporterId,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => $data['priority'],
            'status' => 'pending',
            'type' => $data['type'] ?? 'other',
        ]);
    }

    public function getIssueDetail(string $businessPublicId, string $issuePublicId): IspMaintenanceIssue
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();

        $issue = $this->repository->findIssueByPublicId($issuePublicId);

        if (!$issue || $issue->business_id !== $business->id) {
            abort(404, 'Maintenance issue not found.');
        }

        return $issue;
    }

    public function updateIssue(string $businessPublicId, string $issuePublicId, array $data): IspMaintenanceIssue
    {
        $issue = $this->getIssueDetail($businessPublicId, $issuePublicId);

        if (isset($data['status']) && $data['status'] === 'resolved') {
            $data['resolved_at'] = now();
        }

        $this->repository->updateIssue($issue, $data);
        $issue->refresh();

        // Auto-activate reseller if installation is resolved
        if (($data['status'] ?? null) === 'resolved' && $issue->type === 'installation') {
            $issue->reseller()->update(['is_active' => true]);
        }

        return $issue;
    }

    public function logActivity(string $businessPublicId, string $issuePublicId, int $technicianId, array $data)
    {
        $issue = $this->getIssueDetail($businessPublicId, $issuePublicId);

        $log = $this->repository->createLog([
            'issue_id' => $issue->id,
            'technician_id' => $technicianId,
            'action_taken' => $data['action_taken'],
            'result' => $data['result'],
            'notes' => $data['notes'] ?? null,
            'notes' => $data['notes'] ?? null,
            'photos' => $this->handlePhotoUploads($data['photos'] ?? null),
        ]);

        // Handle Inventory Items
        if (isset($data['items']) && is_array($data['items'])) {
            foreach ($data['items'] as $itemData) {
                // Attach to log
                $this->repository->attachItemToLog($log, $itemData['item_id'], $itemData['quantity'], $itemData['notes'] ?? null);

                // Deduct stock
                $item = \App\Models\IspMaintenanceItem::find($itemData['item_id']);
                if ($item) {
                    $item->decrement('stock', $itemData['quantity']);
                }
            }
        }

        // Prepare update data
        $updateData = [];

        // Auto-assign technician if not already assigned
        if (!$issue->assigned_technician_id) {
            $updateData['assigned_technician_id'] = $technicianId;
        }

        // Auto-update issue status logic
        if ($data['result'] === 'success') {
            $updateData['status'] = 'resolved';
            $updateData['resolved_at'] = now();
        } elseif ($data['result'] === 'pending') {
            $updateData['status'] = 'in_progress';
        }

        // Perform update if there are changes
        if (!empty($updateData)) {
            $this->repository->updateIssue($issue, $updateData);

            // Auto-activate reseller if installation is resolved via log success
            if (($updateData['status'] ?? null) === 'resolved' && $issue->type === 'installation') {
                $issue->reseller()->update(['is_active' => true]);
            }
        }

        return $log;
    }

    public function getInventoryItems(string $businessPublicId)
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();
        return $this->repository->getItemsByBusinessId($business->id);
    }

    public function createInventoryItem(string $businessPublicId, array $data)
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();
        $data['business_id'] = $business->id;
        return $this->repository->createItem($data);
    }

    protected function handlePhotoUploads($photos)
    {
        if (!$photos || !is_array($photos)) {
            return null;
        }

        $paths = [];
        foreach ($photos as $photo) {
            if ($photo instanceof \Illuminate\Http\UploadedFile) {
                $path = $photo->store('maintenance/logs', 'public');
                $paths[] = $path;
            } else {
                // If it's already a string (maybe from existing data or API quirk), keep it
                $paths[] = $photo;
            }
        }
        return $paths;
    }
}

<?php

namespace App\Repositories;

use App\Models\IspMaintenanceIssue;
use App\Models\IspMaintenanceLog;
use Illuminate\Database\Eloquent\Collection;

class IspMaintenanceRepository
{
    public function getIssuesByBusinessId(int $businessId, array $filters = []): Collection
    {
        $query = IspMaintenanceIssue::where('business_id', $businessId)
            ->with(['reseller', 'assignedTechnician', 'reporter']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter for Technicians: See own assignments, own reports, or pending (unassigned) tasks
        if (isset($filters['technician_isolation_id'])) {
            $userId = $filters['technician_isolation_id'];
            $query->where(function ($q) use ($userId) {
                $q->where('assigned_technician_id', $userId)
                    ->orWhere('reporter_id', $userId)
                    ->orWhere('status', 'pending');
            });
        }

        return $query->latest('reported_at')->get();
    }

    public function findIssueByPublicId(string $publicId): ?IspMaintenanceIssue
    {
        return IspMaintenanceIssue::where('public_id', $publicId)
            ->with(['reseller', 'assignedTechnician', 'reporter', 'logs.technician'])
            ->first();
    }

    public function createIssue(array $data): IspMaintenanceIssue
    {
        return IspMaintenanceIssue::create($data);
    }

    public function updateIssue(IspMaintenanceIssue $issue, array $data): bool
    {
        return $issue->update($data);
    }

    public function createLog(array $data): IspMaintenanceLog
    {
        return IspMaintenanceLog::create($data);
    }

    public function getItemsByBusinessId(int $businessId): Collection
    {
        return \App\Models\IspMaintenanceItem::where('business_id', $businessId)->get();
    }

    public function createItem(array $data): \App\Models\IspMaintenanceItem
    {
        return \App\Models\IspMaintenanceItem::create($data);
    }

    public function updateItem(\App\Models\IspMaintenanceItem $item, array $data): bool
    {
        return $item->update($data);
    }

    public function attachItemToLog(IspMaintenanceLog $log, int $itemId, int $quantity, ?string $notes = null)
    {
        $log->items()->attach($itemId, ['quantity' => $quantity, 'notes' => $notes]);
    }
}

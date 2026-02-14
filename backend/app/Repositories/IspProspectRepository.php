<?php

namespace App\Repositories;

use App\Models\IspProspect;
use Illuminate\Database\Eloquent\Collection;

class IspProspectRepository
{
    public function findByBusiness(int $businessId, array $filters = []): Collection
    {
        $query = IspProspect::where('business_id', $businessId)
            ->with(['sales', 'approvedByUser', 'outlet', 'maintenanceIssue', 'readinessConfirmations.user', 'assignedTechnician']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['sales_id'])) {
            $query->where('sales_id', $filters['sales_id']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function findByPublicId(string $publicId): ?IspProspect
    {
        return IspProspect::where('public_id', $publicId)
            ->with(['sales', 'approvedByUser', 'outlet', 'maintenanceIssue', 'readinessConfirmations.user', 'assignedTechnician'])
            ->first();
    }

    public function findBySales(int $salesId): Collection
    {
        return IspProspect::where('sales_id', $salesId)
            ->with(['business', 'outlet'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create(array $data): IspProspect
    {
        return IspProspect::create($data);
    }

    public function update(IspProspect $prospect, array $data): IspProspect
    {
        $prospect->update($data);
        $prospect->refresh();
        return $prospect;
    }
}

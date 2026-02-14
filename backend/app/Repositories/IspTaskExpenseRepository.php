<?php

namespace App\Repositories;

use App\Models\IspTaskExpense;
use Illuminate\Database\Eloquent\Collection;

class IspTaskExpenseRepository
{
    /**
     * Get all expenses for a specific maintenance issue
     */
    public function getExpensesByIssueId(int $issueId): Collection
    {
        return IspTaskExpense::where('maintenance_issue_id', $issueId)
            ->with('technician:id,name')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get all expenses for a business with optional filters
     */
    public function getExpensesByBusinessId(int $businessId, array $filters = []): Collection
    {
        $query = IspTaskExpense::whereHas('maintenanceIssue', function ($q) use ($businessId) {
            $q->where('business_id', $businessId);
        })->with(['technician:id,name', 'maintenanceIssue:id,public_id,title,type']);

        // Filter by technician
        if (!empty($filters['technician_id'])) {
            $query->where('user_id', $filters['technician_id']);
        }

        // Filter by category
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Create a new expense
     */
    public function createExpense(array $data): IspTaskExpense
    {
        return IspTaskExpense::create($data);
    }

    /**
     * Update an expense
     */
    public function updateExpense(IspTaskExpense $expense, array $data): bool
    {
        return $expense->update($data);
    }

    /**
     * Delete an expense
     */
    public function deleteExpense(IspTaskExpense $expense): bool
    {
        return $expense->delete();
    }

    /**
     * Find expense by public ID
     */
    public function findByPublicId(string $publicId): ?IspTaskExpense
    {
        return IspTaskExpense::where('public_id', $publicId)->first();
    }

    /**
     * Get total expenses for a maintenance issue
     */
    public function getTotalExpensesByIssueId(int $issueId): float
    {
        return IspTaskExpense::where('maintenance_issue_id', $issueId)
            ->sum('amount');
    }
}

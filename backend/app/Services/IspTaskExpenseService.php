<?php

namespace App\Services;

use App\Models\Business;
use App\Models\IspTaskExpense;
use App\Repositories\IspTaskExpenseRepository;
use App\Services\AccountingRuleEngine;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class IspTaskExpenseService
{
    protected $repository;
    protected $accountingRuleEngine;

    // Expense limits per category (in IDR)
    const EXPENSE_LIMITS = [
        'transport' => 200000,
        'food_drink' => 100000,
        'other' => 50000,
    ];

    public function __construct(
        IspTaskExpenseRepository $repository,
        AccountingRuleEngine $accountingRuleEngine
    ) {
        $this->repository = $repository;
        $this->accountingRuleEngine = $accountingRuleEngine;
    }

    /**
     * Get all expenses for a maintenance issue
     */
    public function getExpensesByIssue(string $businessPublicId, int $issueId): Collection
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();
        return $this->repository->getExpensesByIssueId($issueId);
    }

    /**
     * Get all expenses for a business with filters
     */
    public function getExpensesByBusiness(string $businessPublicId, array $filters = []): Collection
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();
        return $this->repository->getExpensesByBusinessId($business->id, $filters);
    }

    /**
     * Create a new expense with validation
     */
    public function createExpense(string $businessPublicId, int $issueId, int $userId, array $data): IspTaskExpense
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();

        // Validate expense amount against category limit
        $category = $data['category'];
        $amount = $data['amount'];

        if (!isset(self::EXPENSE_LIMITS[$category])) {
            throw new \InvalidArgumentException("Invalid expense category: {$category}");
        }

        if ($amount > self::EXPENSE_LIMITS[$category]) {
            $limit = number_format(self::EXPENSE_LIMITS[$category], 0, ',', '.');
            throw new \InvalidArgumentException("Expense amount exceeds limit for {$category}. Maximum: Rp {$limit}");
        }

        // Handle receipt photo upload
        $receiptPath = null;
        if (!empty($data['receipt_photo'])) {
            $receiptPath = $this->handleReceiptUpload($data['receipt_photo']);
        }

        $expense = $this->repository->createExpense([
            'maintenance_issue_id' => $issueId,
            'user_id' => $userId,
            'category' => $category,
            'amount' => $amount,
            'description' => $data['description'] ?? null,
            'receipt_photo' => $receiptPath,
        ]);

        // Emit journal entry event
        $maintenanceIssue = $expense->maintenanceIssue;
        $this->accountingRuleEngine->emitEvent([
            'event_code' => 'EVT_EXPENSE_LOGGED',
            'ref_type' => 'isp_task_expense',
            'ref_id' => $expense->id,
            'occurred_at' => now(),
            'actor' => [
                'user_id' => $userId,
                'channel_type' => 'mobile',
            ],
            'payload' => [
                'expense_amount' => $amount,
                'category' => $category,
                'issue_id' => $issueId,
                'technician_id' => $userId,
            ],
            'tenant_id' => $maintenanceIssue->business->tenant_id,
            'business_id' => $maintenanceIssue->business_id,
        ]);

        return $expense;
    }

    /**
     * Delete an expense
     */
    public function deleteExpense(string $businessPublicId, string $expensePublicId): bool
    {
        $business = Business::where('public_id', $businessPublicId)->firstOrFail();
        $expense = $this->repository->findByPublicId($expensePublicId);

        if (!$expense) {
            throw new \Exception('Expense not found');
        }

        // Verify expense belongs to this business
        if ($expense->maintenanceIssue->business_id !== $business->id) {
            throw new \Exception('Unauthorized');
        }

        // Delete receipt photo if exists
        if ($expense->receipt_photo) {
            Storage::disk('public')->delete($expense->receipt_photo);
        }

        return $this->repository->deleteExpense($expense);
    }

    /**
     * Get total expenses for a maintenance issue
     */
    public function getTotalExpenses(int $issueId): float
    {
        return $this->repository->getTotalExpensesByIssueId($issueId);
    }

    /**
     * Handle receipt photo upload
     */
    protected function handleReceiptUpload($photo): ?string
    {
        if ($photo instanceof \Illuminate\Http\UploadedFile) {
            return $photo->store('expenses/receipts', 'public');
        }
        return null;
    }

    /**
     * Get expense limits
     */
    public static function getExpenseLimits(): array
    {
        return self::EXPENSE_LIMITS;
    }
}

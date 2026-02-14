<?php

namespace App\Http\Controllers;

use App\Services\IspTaskExpenseService;
use App\Services\IspMaintenanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class IspTaskExpenseController extends Controller
{
    protected $expenseService;
    protected $maintenanceService;

    public function __construct(
        IspTaskExpenseService $expenseService,
        IspMaintenanceService $maintenanceService
    ) {
        $this->expenseService = $expenseService;
        $this->maintenanceService = $maintenanceService;
    }

    /**
     * Get all expenses for a specific maintenance issue
     */
    public function getIssueExpenses(string $public_id, string $issue_public_id)
    {
        $issue = $this->maintenanceService->getIssueDetail($public_id, $issue_public_id);
        $expenses = $this->expenseService->getExpensesByIssue($public_id, $issue->id);
        $total = $this->expenseService->getTotalExpenses($issue->id);

        return response()->json([
            'expenses' => $expenses,
            'total' => $total,
            'limits' => IspTaskExpenseService::getExpenseLimits(),
        ]);
    }

    /**
     * Get all expenses for a business (finance dashboard)
     */
    public function getBusinessExpenses(Request $request, string $public_id)
    {
        $filters = $request->only(['technician_id', 'category', 'date_from', 'date_to']);
        $expenses = $this->expenseService->getExpensesByBusiness($public_id, $filters);

        return response()->json([
            'expenses' => $expenses,
            'total' => $expenses->sum('amount'),
        ]);
    }

    /**
     * Submit a new expense
     */
    public function store(Request $request, string $public_id, string $issue_public_id)
    {
        $validated = $request->validate([
            'category' => ['required', Rule::in(['transport', 'food_drink', 'other'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:500'],
            'receipt_photo' => ['nullable', 'image', 'max:10240'], // 10MB max
        ]);

        try {
            $issue = $this->maintenanceService->getIssueDetail($public_id, $issue_public_id);

            $expense = $this->expenseService->createExpense(
                $public_id,
                $issue->id,
                Auth::id(),
                $validated
            );

            return response()->json([
                'message' => 'Expense submitted successfully',
                'expense' => $expense->load('technician:id,name'),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit expense',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an expense
     */
    public function destroy(string $public_id, string $expense_public_id)
    {
        try {
            $this->expenseService->deleteExpense($public_id, $expense_public_id);

            return response()->json([
                'message' => 'Expense deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete expense',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

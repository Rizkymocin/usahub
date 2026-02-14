<?php

namespace App\Http\Controllers;

use App\Services\AccountingPeriodService;
use Illuminate\Http\Request;

class AccountingPeriodController extends Controller
{
    protected $service;

    public function __construct(AccountingPeriodService $service)
    {
        $this->service = $service;
    }

    /**
     * Get all periods for a business
     */
    public function index(Request $request, $businessPublicId)
    {
        try {
            $periods = $this->service->getAllPeriods($businessPublicId);

            return response()->json([
                'success' => true,
                'data' => $periods,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get period summary
     */
    public function summary(Request $request, $businessPublicId, $periodId)
    {
        try {
            $summary = $this->service->getPeriodSummary($periodId);

            return response()->json([
                'success' => true,
                'data' => $summary,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Close a period
     */
    public function close(Request $request, $businessPublicId, $periodId)
    {
        try {
            $period = $this->service->closePeriod($periodId, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Period closed successfully',
                'data' => $period,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reopen a period
     */
    public function reopen(Request $request, $businessPublicId, $periodId)
    {
        try {
            $period = $this->service->reopenPeriod($periodId, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Period reopened successfully',
                'data' => $period,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

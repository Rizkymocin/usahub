<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ReportService;
use App\Models\Tenant;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Helper to get authorized businesses.
     */
    private function getTenantBusinesses(Request $request, ?string $filteredBusinessId = null)
    {
        $tenant = Tenant::where('owner_user_id', $request->user()->id)->first();
        if (!$tenant) {
            abort(403, 'Anda bukan owner aplikasi.');
        }

        $query = $tenant->businesses();
        if ($filteredBusinessId) {
            $query->where('public_id', $filteredBusinessId);
        }

        return $query->get();
    }

    public function getProfitAndLoss(Request $request)
    {
        $businesses = $this->getTenantBusinesses($request, $request->input('business_id'));
        $data = $this->reportService->getProfitAndLoss(
            $businesses,
            $request->input('start_date'),
            $request->input('end_date')
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function getBusinessPerformance(Request $request)
    {
        $businesses = $this->getTenantBusinesses($request);
        $data = $this->reportService->getBusinessPerformance(
            $businesses,
            $request->input('start_date'),
            $request->input('end_date')
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function getCashFlow(Request $request)
    {
        $businesses = $this->getTenantBusinesses($request, $request->input('business_id'));
        $data = $this->reportService->getCashFlow(
            $businesses,
            $request->input('start_date'),
            $request->input('end_date')
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function getArAp(Request $request)
    {
        $businesses = $this->getTenantBusinesses($request, $request->input('business_id'));
        $data = $this->reportService->getArAp($businesses);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function getGeneralLedger(Request $request)
    {
        $businesses = $this->getTenantBusinesses($request, $request->input('business_id'));
        $data = $this->reportService->getGeneralLedger(
            $businesses,
            $request->input('start_date'),
            $request->input('end_date'),
            $request->input('account_code')
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}

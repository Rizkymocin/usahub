<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\ResellerPaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OutletPinLoginController;
use App\Http\Controllers\Auth\MobileAuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ManualJournalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;

Route::post('/register-tenant', [AuthController::class, 'registerTenant']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/outlet/login', [OutletPinLoginController::class, 'login']);

// Mobile Auth Routes
Route::prefix('mobile')->group(function () {
    Route::post('/login', [MobileAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [MobileAuthController::class, 'logout']);
        Route::get('/user', [MobileAuthController::class, 'user']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('reseller-payments', ResellerPaymentController::class);
    Route::apiResource('plans', PlanController::class);
    Route::apiResource('tenants', \App\Http\Controllers\TenantController::class);
    Route::apiResource('businesses', \App\Http\Controllers\BusinessController::class);
    Route::get('/business-by-admin', [\App\Http\Controllers\BusinessController::class, 'getBusinessesByAdmin']);

    // Dashboard Routes
    Route::get('/dashboard/owner', [DashboardController::class, 'getOwnerDashboard']);
    Route::get('/businesses/{public_id}/dashboard', [DashboardController::class, 'getBusinessDashboard']);

    // Reporting Routes
    Route::prefix('tenant/reports')->group(function () {
        Route::get('/profit-loss', [ReportController::class, 'getProfitAndLoss']);
        Route::get('/business-performance', [ReportController::class, 'getBusinessPerformance']);
        Route::get('/cash-flow', [ReportController::class, 'getCashFlow']);
        Route::get('/ar-ap', [ReportController::class, 'getArAp']);
        Route::get('/general-ledger', [ReportController::class, 'getGeneralLedger']);
    });

    // Account Routes
    Route::get('/businesses/{public_id}/accounts', [\App\Http\Controllers\AccountController::class, 'index']);
    Route::post('/businesses/{public_id}/accounts', [\App\Http\Controllers\AccountController::class, 'store']);
    Route::delete('/businesses/{public_id}/accounts/{id}', [\App\Http\Controllers\AccountController::class, 'destroy']);

    // Journal Entry Routes
    Route::get('/businesses/{public_id}/journal-entries', [\App\Http\Controllers\JournalEntryController::class, 'index']);

    // Payments (Piutang & Hutang)
    Route::get('/businesses/{public_id}/payments/pending', [PaymentController::class, 'pending']);
    Route::post('/businesses/{public_id}/payments', [PaymentController::class, 'store']);

    // Manual Journal Entries
    Route::post('/businesses/{public_id}/manual-journals', [ManualJournalController::class, 'store']);

    // Accounting Period Routes
    Route::get('/businesses/{public_id}/accounting-periods', [\App\Http\Controllers\AccountingPeriodController::class, 'index']);
    Route::get('/businesses/{public_id}/accounting-periods/{period_id}/summary', [\App\Http\Controllers\AccountingPeriodController::class, 'summary']);
    Route::post('/businesses/{public_id}/accounting-periods/{period_id}/close', [\App\Http\Controllers\AccountingPeriodController::class, 'close']);
    Route::post('/businesses/{public_id}/accounting-periods/{period_id}/reopen', [\App\Http\Controllers\AccountingPeriodController::class, 'reopen']);


    // User Routes
    Route::post('/businesses/{public_id}/users', [\App\Http\Controllers\BusinessController::class, 'storeUser']);
    Route::get('/businesses/{public_id}/users', [\App\Http\Controllers\BusinessController::class, 'users']);

    // Outlet Routes
    Route::get('/businesses/{public_id}/outlets', [\App\Http\Controllers\BusinessController::class, 'outlets']);
    Route::post('/businesses/{public_id}/outlets', [\App\Http\Controllers\BusinessController::class, 'storeOutlet']);
    Route::put('/businesses/{public_id}/outlets/{outlet_public_id}', [\App\Http\Controllers\BusinessController::class, 'updateOutlet']);
    Route::delete('/businesses/{public_id}/outlets/{outlet_public_id}', [\App\Http\Controllers\BusinessController::class, 'destroyOutlet']);

    // Announcements
    Route::get('/businesses/{public_id}/announcements', [\App\Http\Controllers\IspAnouncementController::class, 'index']);
    Route::post('/businesses/{public_id}/announcements', [\App\Http\Controllers\IspAnouncementController::class, 'store']);
    Route::put('/businesses/{public_id}/announcements/{id}', [\App\Http\Controllers\IspAnouncementController::class, 'update']);
    Route::delete('/businesses/{public_id}/announcements/{id}', [\App\Http\Controllers\IspAnouncementController::class, 'destroy']);

    // Reseller Routes
    Route::get('/businesses/{public_id}/resellers', [\App\Http\Controllers\BusinessController::class, 'resellers']);
    Route::get('/businesses/{public_id}/resellers/active', [\App\Http\Controllers\IspResellerController::class, 'getActive']);
    Route::get('/businesses/{public_id}/resellers/inactive', [\App\Http\Controllers\IspResellerController::class, 'getInactive']);
    Route::post('/businesses/{public_id}/resellers', [\App\Http\Controllers\BusinessController::class, 'storeReseller']);
    Route::post('/businesses/{public_id}/resellers/{reseller_code}/activate', [\App\Http\Controllers\IspResellerController::class, 'activate']);
    Route::put('/businesses/{public_id}/resellers/{reseller_code}', [\App\Http\Controllers\BusinessController::class, 'updateReseller']);
    Route::delete('/businesses/{public_id}/resellers/{reseller_code}', [\App\Http\Controllers\BusinessController::class, 'destroyReseller']);

    // Voucher Product Routes
    Route::post('/businesses/{public_id}/vouchers', [\App\Http\Controllers\IspVoucherController::class, 'store']);
    Route::get('/businesses/{public_id}/vouchers', [\App\Http\Controllers\IspVoucherController::class, 'index']);
    Route::put('/businesses/{public_id}/vouchers/{voucher_public_id}', [\App\Http\Controllers\IspVoucherController::class, 'update']);
    Route::delete('/businesses/{public_id}/vouchers/{voucher_public_id}', [\App\Http\Controllers\IspVoucherController::class, 'destroy']);

    // Voucher Stock Request Routes (Finance → Admin)
    Route::get('/businesses/{public_id}/stock-requests', [\App\Http\Controllers\VoucherStockRequestController::class, 'index']);
    Route::post('/businesses/{public_id}/stock-requests', [\App\Http\Controllers\VoucherStockRequestController::class, 'store']);
    Route::get('/businesses/{public_id}/stock-requests/{request_id}', [\App\Http\Controllers\VoucherStockRequestController::class, 'show']);
    Route::post('/businesses/{public_id}/stock-requests/{request_id}/approve', [\App\Http\Controllers\VoucherStockRequestController::class, 'approve']);
    Route::post('/businesses/{public_id}/stock-requests/{request_id}/reject', [\App\Http\Controllers\VoucherStockRequestController::class, 'reject']);

    // Voucher Sales Routes (Finance sells to Outlet/Reseller)
    Route::get('/businesses/{public_id}/voucher-sales', [\App\Http\Controllers\VoucherSaleController::class, 'index']);
    Route::post('/businesses/{public_id}/voucher-sales', [\App\Http\Controllers\VoucherSaleController::class, 'store']);
    Route::get('/businesses/{public_id}/voucher-sales/pending-delivery', [\App\Http\Controllers\VoucherSaleController::class, 'pendingDeliveries']);
    Route::get('/businesses/{public_id}/voucher-sales/{sale_public_id}', [\App\Http\Controllers\VoucherSaleController::class, 'show']);
    Route::post('/businesses/{public_id}/voucher-sales/{sale_public_id}/mark-delivered', [\App\Http\Controllers\VoucherSaleController::class, 'markDelivered']);
    Route::get('/businesses/{public_id}/voucher-sales/{sale_public_id}/payments', [\App\Http\Controllers\VoucherSalePaymentController::class, 'index']);
    Route::post('/businesses/{public_id}/voucher-sales/{sale_public_id}/payments', [\App\Http\Controllers\VoucherSalePaymentController::class, 'store']);

    // Voucher Stock Allocation Routes
    Route::get('/businesses/{public_id}/voucher-allocations', [\App\Http\Controllers\VoucherStockAllocationController::class, 'index']);
    Route::get('/businesses/{public_id}/voucher-allocations/my-stock', [\App\Http\Controllers\VoucherStockAllocationController::class, 'myStock']);
    Route::get('/businesses/{public_id}/voucher-allocations/my-allocations', [\App\Http\Controllers\VoucherStockAllocationController::class, 'myAllocations']);
    Route::post('/businesses/{public_id}/voucher-allocations', [\App\Http\Controllers\VoucherStockAllocationController::class, 'store']);
    Route::patch('/businesses/{public_id}/voucher-allocations/{allocation}/close', [\App\Http\Controllers\VoucherStockAllocationController::class, 'close']);

    // Voucher Stock Management Routes (Admin manages own stock)
    Route::get('/businesses/{public_id}/voucher-stocks', [\App\Http\Controllers\IspVoucherStockController::class, 'index']);
    Route::get('/businesses/{public_id}/voucher-stocks/summary', [\App\Http\Controllers\IspVoucherStockController::class, 'summary']);
    Route::post('/businesses/{public_id}/voucher-stocks', [\App\Http\Controllers\IspVoucherStockController::class, 'store']);
    Route::put('/businesses/{public_id}/voucher-stocks/{stockId}', [\App\Http\Controllers\IspVoucherStockController::class, 'update']);
    Route::delete('/businesses/{public_id}/voucher-stocks/{stockId}', [\App\Http\Controllers\IspVoucherStockController::class, 'destroy']);

    // Voucher Stock Adjustments (Damage/Loss)
    Route::get('/businesses/{public_id}/voucher-stock-adjustments', [\App\Http\Controllers\VoucherStockAdjustmentController::class, 'index']);
    Route::post('/businesses/{public_id}/voucher-stocks/{stockId}/adjustments', [\App\Http\Controllers\VoucherStockAdjustmentController::class, 'storeWarehouseAdjustment']);
    Route::post('/businesses/{public_id}/voucher-allocations/{allocationId}/adjustments', [\App\Http\Controllers\VoucherStockAdjustmentController::class, 'storeAllocationAdjustment']);

    // Maintenance / Gangguan Routes
    Route::get('/businesses/{public_id}/maintenance-issues', [\App\Http\Controllers\IspMaintenanceIssueController::class, 'index']);
    Route::post('/businesses/{public_id}/maintenance-issues', [\App\Http\Controllers\IspMaintenanceIssueController::class, 'store']);
    Route::get('/businesses/{public_id}/maintenance-issues/{issue_public_id}', [\App\Http\Controllers\IspMaintenanceIssueController::class, 'show']);
    Route::put('/businesses/{public_id}/maintenance-issues/{issue_public_id}', [\App\Http\Controllers\IspMaintenanceIssueController::class, 'update']);

    // Maintenance Inventory
    Route::get('/businesses/{public_id}/maintenance-items', [\App\Http\Controllers\IspMaintenanceIssueController::class, 'items']);
    Route::post('/businesses/{public_id}/maintenance-items', [\App\Http\Controllers\IspMaintenanceIssueController::class, 'storeItem']);

    // Maintenance Logs (Technician updates)
    Route::post('/businesses/{public_id}/maintenance-issues/{issue_public_id}/logs', [\App\Http\Controllers\IspMaintenanceLogController::class, 'store']);

    // Task Expenses (Technician personal expenses)
    Route::get('/businesses/{public_id}/maintenance-issues/{issue_public_id}/expenses', [\App\Http\Controllers\IspTaskExpenseController::class, 'getIssueExpenses']);
    Route::post('/businesses/{public_id}/maintenance-issues/{issue_public_id}/expenses', [\App\Http\Controllers\IspTaskExpenseController::class, 'store']);
    Route::get('/businesses/{public_id}/expenses', [\App\Http\Controllers\IspTaskExpenseController::class, 'getBusinessExpenses']);
    Route::delete('/businesses/{public_id}/expenses/{expense_public_id}', [\App\Http\Controllers\IspTaskExpenseController::class, 'destroy']);


    // Prospect (Calon Pasang Baru) Routes
    Route::get('/businesses/{public_id}/prospects', [\App\Http\Controllers\IspProspectController::class, 'index']);
    Route::post('/businesses/{public_id}/prospects', [\App\Http\Controllers\IspProspectController::class, 'store']);
    Route::get('/businesses/{public_id}/prospects/{prospect_public_id}', [\App\Http\Controllers\IspProspectController::class, 'show']);
    Route::post('/businesses/{public_id}/prospects/{prospect_public_id}/approve', [\App\Http\Controllers\IspProspectController::class, 'approve']);
    Route::post('/businesses/{public_id}/prospects/{prospect_public_id}/reject', [\App\Http\Controllers\IspProspectController::class, 'reject']);
    Route::post('/businesses/{public_id}/prospects/{prospect_public_id}/re-approve', [\App\Http\Controllers\IspProspectController::class, 'reApprove']);
    Route::post('/businesses/{public_id}/prospects/{prospect_public_id}/activate', [\App\Http\Controllers\IspProspectController::class, 'activate']);
    Route::post('/businesses/{public_id}/prospects/{prospect_public_id}/confirm-readiness', [\App\Http\Controllers\IspProspectController::class, 'confirmReadiness']);
    Route::post('/businesses/{public_id}/prospects/{prospect_public_id}/assign-technician', [\App\Http\Controllers\IspProspectController::class, 'assignTechnician']);

    // My Prospects (for mobile sales)
    Route::get('/isp/my-prospects', [\App\Http\Controllers\IspProspectController::class, 'myProspects']);

    // n8n Webhook Data Endpoints
    Route::get('/webhooks/n8n/prospect-approved/{prospect_public_id}', [\App\Http\Controllers\N8nWebhookController::class, 'prospectApproved']);
    Route::get('/webhooks/n8n/technician-assigned/{prospect_public_id}', [\App\Http\Controllers\N8nWebhookController::class, 'technicianAssigned']);
    // Reseller Registration Routes
    Route::get('/reseller-registrations', [\App\Http\Controllers\IspResellerRegistrationController::class, 'index']);
    Route::post('/reseller-registrations/{registration_id}/approve', [\App\Http\Controllers\IspResellerRegistrationController::class, 'approve']);

    // ISP Purchase Routes
    Route::get('/businesses/{public_id}/purchases', [\App\Http\Controllers\IspPurchaseController::class, 'index']);
    Route::post('/businesses/{public_id}/purchases', [\App\Http\Controllers\IspPurchaseController::class, 'store']);

    // Activity Log Routes
    Route::get('/businesses/{public_id}/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index']);

    // ISP Configurations
    Route::get('/businesses/{public_id}/configurations', [\App\Http\Controllers\IspConfigurationController::class, 'index']);
    Route::post('/businesses/{public_id}/configurations', [\App\Http\Controllers\IspConfigurationController::class, 'store']);
});

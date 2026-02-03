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

Route::post('/register-tenant', [AuthController::class, 'registerTenant']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/outlet/login', [OutletPinLoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('reseller-payments', ResellerPaymentController::class);
    Route::apiResource('plans', PlanController::class);
    Route::apiResource('tenants', \App\Http\Controllers\TenantController::class);
    Route::apiResource('businesses', \App\Http\Controllers\BusinessController::class);
    Route::get('/business-by-admin', [\App\Http\Controllers\BusinessController::class, 'getBusinessesByAdmin']);

    // Account Routes
    Route::get('/businesses/{public_id}/accounts', [\App\Http\Controllers\AccountController::class, 'index']);
    Route::post('/businesses/{public_id}/accounts', [\App\Http\Controllers\AccountController::class, 'store']);
    Route::delete('/businesses/{public_id}/accounts/{id}', [\App\Http\Controllers\AccountController::class, 'destroy']);

    // User Routes
    Route::post('/businesses/{public_id}/users', [\App\Http\Controllers\BusinessController::class, 'storeUser']);
    Route::get('/businesses/{public_id}/users', [\App\Http\Controllers\BusinessController::class, 'users']);

    // Outlet Routes
    Route::get('/businesses/{public_id}/outlets', [\App\Http\Controllers\BusinessController::class, 'outlets']);
    Route::post('/businesses/{public_id}/outlets', [\App\Http\Controllers\BusinessController::class, 'storeOutlet']);
    Route::put('/businesses/{public_id}/outlets/{outlet_public_id}', [\App\Http\Controllers\BusinessController::class, 'updateOutlet']);
    Route::delete('/businesses/{public_id}/outlets/{outlet_public_id}', [\App\Http\Controllers\BusinessController::class, 'destroyOutlet']);

    // Reseller Routes
    Route::get('/businesses/{public_id}/resellers', [\App\Http\Controllers\BusinessController::class, 'resellers']);
    Route::post('/businesses/{public_id}/resellers', [\App\Http\Controllers\BusinessController::class, 'storeReseller']);
    Route::put('/businesses/{public_id}/resellers/{reseller_code}', [\App\Http\Controllers\BusinessController::class, 'updateReseller']);
    Route::delete('/businesses/{public_id}/resellers/{reseller_code}', [\App\Http\Controllers\BusinessController::class, 'destroyReseller']);
});

Route::middleware(['auth:sanctum', 'role:isp_outlet'])->group(function () {
    // endpoint outlet
});

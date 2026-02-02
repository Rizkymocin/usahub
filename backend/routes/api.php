<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\ResellerPaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\AuthController;

Route::post('/register-tenant', [AuthController::class, 'registerTenant']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('reseller-payments', ResellerPaymentController::class);
    Route::apiResource('plans', PlanController::class);
    Route::apiResource('tenants', \App\Http\Controllers\TenantController::class);
    Route::apiResource('businesses', \App\Http\Controllers\BusinessController::class);

    // Account Routes
    Route::get('/businesses/{public_id}/accounts', [\App\Http\Controllers\AccountController::class, 'index']);
    Route::get('/businesses/{public_id}/users', [\App\Http\Controllers\BusinessController::class, 'users']);
    Route::post('/businesses/{public_id}/users', [\App\Http\Controllers\BusinessController::class, 'storeUser']);
    Route::post('/businesses/{public_id}/accounts', [\App\Http\Controllers\AccountController::class, 'store']);
    Route::delete('/businesses/{public_id}/accounts/{id}', [\App\Http\Controllers\AccountController::class, 'destroy']);
});

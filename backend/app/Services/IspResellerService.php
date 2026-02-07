<?php

namespace App\Services;

use App\Models\Business;
use App\Models\IspReseller;
use App\Repositories\IspResellerRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Exception;

use App\Services\IspMaintenanceService;

class IspResellerService
{
    protected $resellerRepository;
    protected $maintenanceService;

    public function __construct(IspResellerRepository $resellerRepository, IspMaintenanceService $maintenanceService)
    {
        $this->resellerRepository = $resellerRepository;
        $this->maintenanceService = $maintenanceService;
    }

    public function getBusinessResellers(int $businessId): Collection
    {
        return $this->resellerRepository->findByBusiness($businessId);
    }

    public function getActiveResellers(int $businessId): Collection
    {
        return $this->resellerRepository->findActiveByBusiness($businessId);
    }

    public function getInactiveResellers(int $businessId): Collection
    {
        return $this->resellerRepository->findInactiveByBusiness($businessId);
    }

    public function activateReseller(string $resellerCode, int $tenantId): bool
    {
        return $this->resellerRepository->updateByCode($resellerCode, $tenantId, [
            'is_active' => true
        ]);
    }

    public function registerReseller(Business $business, array $data, int $reporterId): IspReseller
    {
        return DB::transaction(function () use ($business, $data, $reporterId) {
            // Generate Code if not provided
            $code = $data['code'] ?? $this->generateResellerCode($business);

            // Default Outlet (Use first logic or specific logic, here assuming first for simplicity if not provided)
            // Or validation should ensure outlet_id is passed if multiple exist.
            $outletId = $data['outlet_id'] ?? $business->outlets()->first()->id;

            if (!$outletId) {
                throw new Exception("Business has no outlets to assign reseller to.");
            }

            $resellerData = [
                'tenant_id' => $business->tenant_id,
                'business_id' => $business->id,
                'outlet_id' => $outletId,
                'code' => $code,
                'name' => $data['name'],
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'is_active' => false, // New resellers require installation and activation
            ];

            $reseller = $this->resellerRepository->create($resellerData);

            // Create Installation Maintenance Ticket
            $this->createInstallationTicket($business, $reseller, $reporterId);

            return $reseller;
        });
    }

    private function createInstallationTicket(Business $business, IspReseller $reseller, int $reporterId)
    {
        $description = "Instalasi perangkat untuk reseller baru: {$reseller->name}.\n";
        $description .= "Alamat: " . ($reseller->address ?? 'Tidak ada alamat') . "\n";
        if ($reseller->latitude && $reseller->longitude) {
            $description .= "Koordinat: {$reseller->latitude}, {$reseller->longitude}\n";
            $description .= "Google Maps: https://www.google.com/maps/search/?api=1&query={$reseller->latitude},{$reseller->longitude}";
        }

        $this->maintenanceService->createIssue($business->public_id, $reporterId, [
            'reseller_id' => $reseller->id, // Service expects ID, checking createIssue implementation
            'title' => "Pasang Baru - " . $reseller->name,
            'description' => $description,
            'priority' => 'high',
            'type' => 'installation',
        ]);
    }

    private function generateResellerCode(Business $business): string
    {
        $prefix = strtoupper(substr($business->name, 0, 3));
        $unique = mt_rand(10000, 99999);
        return $prefix . '-R' . $unique;
    }
}

<?php

namespace App\Services;

use App\Models\Business;
use App\Models\IspInstallationReadiness;
use App\Models\IspProspect;
use App\Models\IspReseller;
use App\Repositories\IspProspectRepository;
use App\Repositories\IspResellerRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class IspProspectService
{
    protected $repository;
    protected $resellerRepository;
    protected $maintenanceService;
    protected $accountingRuleEngine;

    public function __construct(
        IspProspectRepository $repository,
        IspResellerRepository $resellerRepository,
        IspMaintenanceService $maintenanceService,
        AccountingRuleEngine $accountingRuleEngine
    ) {
        $this->repository = $repository;
        $this->resellerRepository = $resellerRepository;
        $this->maintenanceService = $maintenanceService;
        $this->accountingRuleEngine = $accountingRuleEngine;
    }

    /**
     * Sales registers a new prospect customer.
     */
    public function register(Business $business, array $data, int $salesId): IspProspect
    {
        // Resolve outlet
        $outletId = $data['outlet_id'] ?? null;
        if (isset($data['outlet_public_id'])) {
            $outlet = $business->outlets()->where('public_id', $data['outlet_public_id'])->first();
            if ($outlet) {
                $outletId = $outlet->id;
            }
        } elseif (!$outletId) {
            $outlet = $business->outlets()->first();
            $outletId = $outlet?->id;
        }



        $prospect = $this->repository->create([
            'business_id' => $business->id,
            'outlet_id' => $outletId,
            'sales_id' => $salesId,
            'name' => $data['name'],
            'phone' => $data['phone'],
            'address' => $data['address'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'status' => 'waiting',
        ]);

        // Log Activity
        activity()
            ->causedBy(\App\Models\User::find($salesId))
            ->performedOn($prospect)
            ->withProperties([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null
            ])
            ->event('registered')
            ->log('Sales registered new prospect');

        return $prospect;
    }

    /**
     * Get prospects for a business with optional filters.
     */
    public function getByBusiness(int $businessId, array $filters = []): Collection
    {
        return $this->repository->findByBusiness($businessId, $filters);
    }

    /**
     * Get prospects registered by a specific sales user.
     */
    public function getBySales(int $salesId): Collection
    {
        return $this->repository->findBySales($salesId);
    }

    /**
     * Get a single prospect by public_id.
     */
    public function getByPublicId(string $publicId): ?IspProspect
    {
        return $this->repository->findByPublicId($publicId);
    }

    /**
     * Admin approves a prospect and creates an installation ticket.
     */
    public function approve(string $publicId, int $adminId, string $note = null, float $commissionAmount = 0): IspProspect
    {
        $prospect = $this->repository->findByPublicId($publicId);

        if (!$prospect) {
            throw new Exception("Prospect not found.");
        }

        if (!in_array($prospect->status, ['waiting'])) {
            throw new Exception("Only prospects with 'waiting' status can be approved.");
        }

        return DB::transaction(function () use ($prospect, $adminId, $note, $commissionAmount) {
            // Update prospect status
            $prospect = $this->repository->update($prospect, [
                'status' => 'approved',
                'admin_note' => $note,
                'approved_by' => $adminId,
                'approved_at' => now(),
            ]);

            // Create installation ticket
            $issue = $this->createInstallationTicket($prospect);

            // Link the maintenance issue
            $this->repository->update($prospect, [
                'maintenance_issue_id' => $issue->id,
            ]);

            // Emit accounting event for commission
            if ($commissionAmount > 0) {
                try {
                    $this->accountingRuleEngine->emitEvent([
                        'event_code' => 'EVT_REGISTRATION_APPROVED',
                        'ref_type' => 'isp_prospect',
                        'ref_id' => $prospect->id,
                        'occurred_at' => now(),
                        'actor' => [
                            'user_id' => $adminId,
                            'channel_type' => 'web',
                        ],
                        'payload' => [
                            'commission_amount' => $commissionAmount,
                            'sales_id' => $prospect->sales_id,
                            'sales_name' => $prospect->sales->name ?? 'Unknown',
                            'prospect_name' => $prospect->name,
                        ],
                        'tenant_id' => $prospect->business->tenant_id,
                        'business_id' => $prospect->business_id,
                    ]);
                } catch (Exception $e) {
                    Log::error("Failed to create journal entry for prospect approval: " . $e->getMessage());
                }
            }

            return $prospect;
        });
    }

    /**
     * Admin rejects a prospect.
     */
    public function reject(string $publicId, int $adminId, string $note): IspProspect
    {
        $prospect = $this->repository->findByPublicId($publicId);

        if (!$prospect) {
            throw new Exception("Prospect not found.");
        }

        if (!in_array($prospect->status, ['waiting'])) {
            throw new Exception("Only prospects with 'waiting' status can be rejected.");
        }

        return $this->repository->update($prospect, [
            'status' => 'rejected',
            'admin_note' => $note,
            'approved_by' => $adminId,
        ]);
    }

    /**
     * Admin re-approves after teknisi rejection, creates new installation ticket.
     */
    public function reApprove(string $publicId, int $adminId, string $note = null): IspProspect
    {
        $prospect = $this->repository->findByPublicId($publicId);

        if (!$prospect) {
            throw new Exception("Prospect not found.");
        }

        if ($prospect->status !== 'installation_rejected') {
            throw new Exception("Only prospects with 'installation_rejected' status can be re-approved.");
        }

        return DB::transaction(function () use ($prospect, $adminId, $note) {
            $prospect = $this->repository->update($prospect, [
                'status' => 'approved',
                'admin_note' => $note,
                'approved_by' => $adminId,
                'approved_at' => now(),
                'technician_note' => null, // Clear old technician note
            ]);

            // Create a new installation ticket
            $issue = $this->createInstallationTicket($prospect);

            $this->repository->update($prospect, [
                'maintenance_issue_id' => $issue->id,
            ]);

            return $prospect;
        });
    }

    /**
     * Mark prospect as installed (called when technician completes installation).
     */
    public function markInstalled(IspProspect $prospect): IspProspect
    {
        if (!in_array($prospect->status, ['approved'])) {
            throw new Exception("Only approved prospects can be marked as installed.");
        }

        return $this->repository->update($prospect, [
            'status' => 'installed',
            'installed_at' => now(),
        ]);
    }

    /**
     * Mark prospect installation as rejected by technician.
     */
    public function markInstallationRejected(IspProspect $prospect, string $note): IspProspect
    {
        if ($prospect->status !== 'approved') {
            throw new Exception("Only approved prospects can have their installation rejected.");
        }

        return $this->repository->update($prospect, [
            'status' => 'installation_rejected',
            'technician_note' => $note,
        ]);
    }

    /**
     * Admin activates a prospect: creates entry in isp_resellers.
     */
    public function activate(string $publicId, int $adminId): IspProspect
    {
        $prospect = $this->repository->findByPublicId($publicId);

        if (!$prospect) {
            throw new Exception("Prospect not found.");
        }

        if ($prospect->status !== 'installed') {
            throw new Exception("Only installed prospects can be activated.");
        }

        $business = $prospect->business;

        return DB::transaction(function () use ($prospect, $business, $adminId) {
            // Generate reseller code
            $prefix = strtoupper(substr($business->name, 0, 3));
            $code = 'RES-' . now()->timestamp . '-' . Str::random(3);

            // Create the reseller
            $reseller = $this->resellerRepository->create([
                'tenant_id' => $business->tenant_id,
                'business_id' => $business->id,
                'outlet_id' => $prospect->outlet_id ?? $business->outlets()->first()?->id,
                'code' => $code,
                'name' => $prospect->name,
                'phone' => $prospect->phone,
                'address' => $prospect->address,
                'latitude' => $prospect->latitude,
                'longitude' => $prospect->longitude,
                'is_active' => true,
                'created_at' => now(),
            ]);

            // Mark prospect as activated
            $this->repository->update($prospect, [
                'status' => 'activated',
                'activated_at' => now(),
            ]);

            return $prospect;
        });
    }

    /**
     * Create installation maintenance ticket for an approved prospect.
     */
    private function createInstallationTicket(IspProspect $prospect)
    {
        $business = $prospect->business;

        $description = "Instalasi baru untuk pelanggan: {$prospect->name}\n";
        $description .= "Telepon: {$prospect->phone}\n";
        if ($prospect->address) {
            $description .= "Alamat: {$prospect->address}\n";
        }
        if ($prospect->latitude && $prospect->longitude) {
            $description .= "Koordinat: {$prospect->latitude}, {$prospect->longitude}\n";
            $description .= "Google Maps: https://www.google.com/maps/search/?api=1&query={$prospect->latitude},{$prospect->longitude}";
        }

        // We need to create a temporary reseller-like reference for the maintenance issue
        // The maintenance service requires a reseller_id, so we'll pass it as a data field
        // and handle it in the service
        return $this->maintenanceService->createIssue($business->public_id, $prospect->sales_id, [
            'type' => 'installation',
            'title' => 'Pasang Baru - ' . $prospect->name,
            'priority' => 'high',
            'description' => $description,
            'reseller_id' => null, // No reseller yet at this point
        ]);
    }

    /**
     * Teknisi confirms readiness for an approved prospect.
     */
    public function confirmReadiness(string $publicId, int $userId): IspProspect
    {
        $prospect = $this->repository->findByPublicId($publicId);

        if (!$prospect) {
            throw new Exception("Prospect not found.");
        }

        if ($prospect->status !== 'approved') {
            throw new Exception("Only approved prospects can receive readiness confirmations.");
        }

        // Prevent duplicate
        $existing = IspInstallationReadiness::where('prospect_id', $prospect->id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            throw new Exception("Anda sudah mengkonfirmasi kesiapan untuk pekerjaan ini.");
        }

        IspInstallationReadiness::create([
            'prospect_id' => $prospect->id,
            'user_id' => $userId,
            'confirmed_at' => now(),
        ]);

        $prospect->refresh();
        $prospect->load(['readinessConfirmations.user', 'assignedTechnician']);

        return $prospect;
    }

    /**
     * Admin assigns a technician from the list of confirmed readiness.
     */
    public function assignTechnician(string $publicId, int $adminId, int $technicianUserId): IspProspect
    {
        $prospect = $this->repository->findByPublicId($publicId);

        if (!$prospect) {
            throw new Exception("Prospect not found.");
        }

        if ($prospect->status !== 'approved') {
            throw new Exception("Only approved prospects can have a technician assigned.");
        }

        // Verify the technician has confirmed readiness
        $confirmed = IspInstallationReadiness::where('prospect_id', $prospect->id)
            ->where('user_id', $technicianUserId)
            ->exists();

        if (!$confirmed) {
            throw new Exception("Teknisi belum mengkonfirmasi kesiapan untuk pekerjaan ini.");
        }

        return DB::transaction(function () use ($prospect, $technicianUserId) {
            // Assign on the prospect
            $this->repository->update($prospect, [
                'assigned_technician_id' => $technicianUserId,
            ]);

            // Also assign on the linked maintenance issue if exists
            if ($prospect->maintenance_issue_id) {
                $issue = $prospect->maintenanceIssue;
                if ($issue) {
                    $this->maintenanceService->updateIssue(
                        $prospect->business->public_id,
                        $issue->public_id,
                        ['assigned_technician_id' => $technicianUserId, 'status' => 'assigned']
                    );
                }
            }

            $prospect->refresh();
            $prospect->load(['readinessConfirmations.user', 'assignedTechnician']);

            return $prospect;
        });
    }
}

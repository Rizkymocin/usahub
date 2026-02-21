<?php

namespace App\Services;

use App\Models\Business;
use App\Models\IspConfiguration;
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
    public function approve(string $publicId, int $adminId, string $note = null, float $commissionAmount = 0, ?int $uplinkResellerId = null): IspProspect
    {
        $prospect = $this->repository->findByPublicId($publicId);

        if (!$prospect) {
            throw new Exception("Prospect not found.");
        }

        if (!in_array($prospect->status, ['waiting'])) {
            throw new Exception("Only prospects with 'waiting' status can be approved.");
        }

        return DB::transaction(function () use ($prospect, $adminId, $note, $commissionAmount, $uplinkResellerId) {
            // Update prospect status
            $prospect = $this->repository->update($prospect, [
                'status' => 'approved',
                'admin_note' => $note,
                'approved_by' => $adminId,
                'approved_at' => now(),
                'uplink_reseller_id' => $uplinkResellerId,
            ]);

            // Assign IP Address if configured
            $this->assignIpAddress($prospect);

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
                'ip_address' => $prospect->ip_address,
                'cidr' => $prospect->cidr,
                'uplink_reseller_id' => $prospect->uplink_reseller_id,
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
            $description .= "Google Maps: https://www.google.com/maps/search/?api=1&query={$prospect->latitude},{$prospect->longitude}\n";
        }
        if ($prospect->ip_address) {
            $description .= "IP Address: {$prospect->ip_address}/{$prospect->cidr}\n";
        }
        if ($prospect->uplinkReseller) {
            $description .= "Uplink Reseller: {$prospect->uplinkReseller->name} ({$prospect->uplinkReseller->code})\n";
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

    /**
     * Calculate and assign the next available IP address to the prospect.
     */
    private function assignIpAddress(IspProspect $prospect): void
    {
        $businessId = $prospect->business_id;

        // Get Configuration
        $startIpConfig = IspConfiguration::where('business_id', $businessId)
            ->where('key', 'reseller_ip_start')
            ->first();

        $cidrConfig = IspConfiguration::where('business_id', $businessId)
            ->where('key', 'reseller_ip_cidr')
            ->first();

        if (!$startIpConfig || !$startIpConfig->value) {
            // No configuration, skip IP assignment
            return;
        }

        $startIp = $startIpConfig->value;
        $cidr = $cidrConfig ? (int)$cidrConfig->value : 24; // Default /24

        // Find last assigned IP
        $lastReseller = IspReseller::where('business_id', $businessId)
            ->whereNotNull('ip_address')
            ->orderBy('id', 'desc')
            ->first();

        $lastProspect = IspProspect::where('business_id', $businessId)
            ->where('id', '!=', $prospect->id) // Exclude current if already exists (though it shouldn't have IP yet)
            ->whereNotNull('ip_address')
            ->orderBy('id', 'desc')
            ->first();

        $lastIp = null;
        if ($lastReseller && $lastProspect) {
            // Determine which one is more recent or higher
            // Assuming sequential allocation, comparing IDs might be enough if we just want "the last one allocated"
            // But let's assume we want the highest IP value to be safe against deletions (?)
            // Actually, simpler is: compare their query timestamps or just pick the max IP.
            // Using ip2long for comparison:
            $resellerIpLong = ip2long($lastReseller->ip_address);
            $prospectIpLong = ip2long($lastProspect->ip_address);
            $lastIp = ($resellerIpLong > $prospectIpLong) ? $lastReseller->ip_address : $lastProspect->ip_address;
        } elseif ($lastReseller) {
            $lastIp = $lastReseller->ip_address;
        } elseif ($lastProspect) {
            $lastIp = $lastProspect->ip_address;
        }

        if (!$lastIp) {
            // First allocation
            // Network is the start IP block.
            // Assuming start_ip is the Network Address (e.g., 10.10.0.0)
            // First host is +1
            $nextIpLong = ip2long($startIp) + 1;
        } else {
            // Calculate next network
            // 1. Get network address of last IP
            // Mask for CIDR: ~((1 << (32 - cidr)) - 1)
            // But simpler: pow(2, 32-cidr) is the block size.
            $blockSize = pow(2, 32 - $cidr);

            // We need to find the Network Address of the last IP.
            // Assuming the Assigned IP is always Network + 1.
            $lastIpLong = ip2long($lastIp);

            // Reconstruct network address: (IP - 1) if we strictly follow "First Host" rule
            // Or better: $lastNetworkLong = ($lastIpLong & ((-1 << (32 - $cidr)))); 
            // Note: Bitwise operations in PHP on 32-bit systems can be tricky.
            // Let's use the block size math.
            // user says: "every reseller allcation IP address is the first host of the network"

            // So if last IP was 10.10.0.1 (Network 10.10.0.0)
            // Next Network should be 10.10.0.0 + BlockSize.
            // Current Network Start = $lastIpLong - 1 (Assuming strictly complying to +1 rule)
            // But to be safer, let's align it to the block size.
            // Actually, $lastIpLong might be 10.10.0.1.
            // Network Start = 10.10.0.0

            // Let's rely on previous IP + (BlockSize - 1) + 1 ? No.
            // Next Network Start = Previous Network Start + BlockSize.

            // Let's try to get Previous Network Start from Previous IP.
            // Since we allocate the FIRST host, the previous network start is simply PreviousIP - 1.
            $lastNetworkStart = $lastIpLong - 1;

            $nextNetworkStart = $lastNetworkStart + $blockSize;
            $nextIpLong = $nextNetworkStart + 1;
        }

        $nextIp = long2ip($nextIpLong);

        $this->repository->update($prospect, [
            'ip_address' => $nextIp,
            'cidr' => $cidr
        ]);
    }
}

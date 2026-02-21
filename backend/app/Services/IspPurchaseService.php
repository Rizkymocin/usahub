<?php

namespace App\Services;

use App\Models\IspPurchase;
use App\Models\IspPurchaseItem;
use App\Models\IspMaintenanceItem;
use App\Repositories\IspPurchaseRepository;
use App\Repositories\BusinessRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\AccountingRuleEngine;

class IspPurchaseService
{
    protected $repository;
    protected $businessRepository;
    protected $accountingRuleEngine;

    public function __construct(
        IspPurchaseRepository $repository,
        BusinessRepository $businessRepository,
        AccountingRuleEngine $accountingRuleEngine
    ) {
        $this->repository = $repository;
        $this->businessRepository = $businessRepository;
        $this->accountingRuleEngine = $accountingRuleEngine;
    }

    public function getPurchasesByBusiness(string $businessPublicId, int $tenantId)
    {
        $business = $this->businessRepository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return null;
        }

        return $this->repository->findByBusiness($business->id);
    }

    public function createPurchase(array $data, string $businessPublicId, int $tenantId, int $userId): IspPurchase
    {
        $business = $this->businessRepository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception("Business not found.");
        }

        return DB::transaction(function () use ($data, $business, $tenantId, $userId) {
            $totalAmount = 0;
            $itemsToCreate = [];

            // Calculate totals and prepare items
            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'item_name' => $item['item_name'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'] ?? 'pcs',
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                    'isp_maintenance_item_id' => $item['isp_maintenance_item_id'] ?? null,
                ];
            }

            // Create Purchase Record
            $purchase = $this->repository->create([
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'business_id' => $business->id,
                'purchase_date' => $data['purchase_date'],
                'type' => $data['type'], // 'maintenance', 'general'
                'total_amount' => $totalAmount,
                'supplier_name' => $data['supplier_name'] ?? null,
                'invoice_number' => $data['invoice_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by_user_id' => $userId,
            ]);

            // Create Items and Update Stock if Maintenance
            foreach ($itemsToCreate as $itemData) {
                // Handle maintenance items (stock update or creation)
                if ($data['type'] === 'maintenance') {
                    $maintenanceItem = null;

                    if (!empty($itemData['isp_maintenance_item_id'])) {
                        // Find by ID
                        $maintenanceItem = IspMaintenanceItem::where('id', $itemData['isp_maintenance_item_id'])
                            ->where('business_id', $business->id)
                            ->first();
                    } else {
                        // Find by Name (exact match, case sensitive typically but depends on DB collation)
                        $maintenanceItem = IspMaintenanceItem::where('business_id', $business->id)
                            ->where('name', $itemData['item_name'])
                            ->first();
                    }

                    if ($maintenanceItem) {
                        // Update existing stock
                        $maintenanceItem->stock += $itemData['quantity'];
                        // Optional: Update price to latest purchase price?
                        // $maintenanceItem->price = $itemData['unit_price']; 
                        $maintenanceItem->save();

                        // Ensure we link to the correct ID
                        $itemData['isp_maintenance_item_id'] = $maintenanceItem->id;
                    } else {
                        // Create new maintenance item
                        $maintenanceItem = IspMaintenanceItem::create([
                            'business_id' => $business->id,
                            'name' => $itemData['item_name'],
                            'unit' => $itemData['unit'] ?? 'pcs',
                            'stock' => $itemData['quantity'],
                            'price' => $itemData['unit_price'],
                        ]);
                        $itemData['isp_maintenance_item_id'] = $maintenanceItem->id;
                    }
                }

                $itemData['isp_purchase_id'] = $purchase->id;
                IspPurchaseItem::create($itemData);
            }

            // Accounting Event Emission
            $paymentMethod = $data['payment_method'] ?? 'cash'; // Default to cash
            $purchaseCategory = ($data['type'] === 'maintenance') ? 'inventory' : 'expense';

            $eventCode = ($paymentMethod === 'credit') ? 'EVT_PURCHASE_ON_CREDIT' : 'EVT_PURCHASE_PAID';

            $this->accountingRuleEngine->emitEvent([
                'event_code' => $eventCode,
                'ref_type' => 'isp_purchase',
                'ref_id' => $purchase->id,
                'occurred_at' => now(),
                'actor' => [
                    'user_id' => $userId,
                    'channel_type' => 'web', // Assuming web mainly
                ],
                'payload' => [
                    'total_amount' => $totalAmount,
                    'purchase_category' => $purchaseCategory,
                    'purchase_id' => $purchase->id,
                    'payment_method' => $paymentMethod,
                ],
                'tenant_id' => $tenantId,
                'business_id' => $business->id,
            ]);

            return $purchase->load(['items.maintenanceItem', 'createdBy']);
        });
    }
}

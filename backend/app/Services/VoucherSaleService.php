<?php

namespace App\Services;

use App\Repositories\VoucherSaleRepository;
use App\Repositories\VoucherSaleItemRepository;
use App\Repositories\BusinessRepository;
use App\Repositories\IspVoucherProductRepository;
use App\Services\VoucherStockAllocationService;
use App\Models\VoucherSale;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class VoucherSaleService
{
    protected $voucherSaleRepository;
    protected $voucherSaleItemRepository;
    protected $businessRepository;
    protected $voucherProductRepository;
    protected $allocationService;

    public function __construct(
        VoucherSaleRepository $voucherSaleRepository,
        VoucherSaleItemRepository $voucherSaleItemRepository,
        BusinessRepository $businessRepository,
        IspVoucherProductRepository $voucherProductRepository,
        VoucherStockAllocationService $allocationService
    ) {
        $this->voucherSaleRepository = $voucherSaleRepository;
        $this->voucherSaleItemRepository = $voucherSaleItemRepository;
        $this->businessRepository = $businessRepository;
        $this->voucherProductRepository = $voucherProductRepository;
        $this->allocationService = $allocationService;
    }

    public function getSalesByBusiness(string $businessPublicId, int $tenantId)
    {
        $business = $this->businessRepository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return null;
        }

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        $userId = null;

        if ($user && !$user->hasAnyRole(['superadmin', 'owner', 'business_admin', 'admin'])) {
            $userId = $user->id;
        }

        return $this->voucherSaleRepository->findByBusiness($business->id, $userId);
    }

    public function getSaleById(string $salePublicId, string $businessPublicId, int $tenantId): ?VoucherSale
    {
        $business = $this->businessRepository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return null;
        }

        return $this->voucherSaleRepository->findByPublicId($salePublicId, $business->id);
    }

    public function createSale(array $data, string $businessPublicId, int $tenantId, int $userId): VoucherSale
    {
        $business = $this->businessRepository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception("Business not found.");
        }

        // Validate channel and get target ID
        if ($data['channel_type'] === 'outlet') {
            if (!isset($data['outlet_id'])) {
                throw new \Exception("Outlet ID is required for outlet sales.");
            }
            $data['reseller_id'] = null;
        } elseif ($data['channel_type'] === 'reseller') {
            if (!isset($data['reseller_id'])) {
                throw new \Exception("Reseller ID is required for reseller sales.");
            }
            $data['outlet_id'] = null;
        } else {
            // channel_type === 'admin'
            // Check sold_to_type to determine if we need to link specific entity
            if (isset($data['sold_to_type'])) {
                if ($data['sold_to_type'] === 'outlet') {
                    $data['outlet_id'] = $data['sold_to_id'] ?? ($data['outlet_id'] ?? null);
                    $data['reseller_id'] = null;
                } elseif ($data['sold_to_type'] === 'reseller') {
                    $data['reseller_id'] = $data['sold_to_id'] ?? ($data['reseller_id'] ?? null);
                    $data['outlet_id'] = null;
                } else {
                    $data['outlet_id'] = null;
                    $data['reseller_id'] = null;
                }
            } else {
                $data['outlet_id'] = null;
                $data['reseller_id'] = null;
            }
        }

        // Validate items and calculate total
        if (!isset($data['items']) || empty($data['items'])) {
            throw new \Exception("Sale items are required.");
        }

        $totalAmount = 0;
        $itemsToCreate = [];

        foreach ($data['items'] as $item) {
            $voucherProduct = $this->voucherProductRepository->findById($item['voucher_product_id'], $tenantId);
            if (!$voucherProduct) {
                throw new \Exception("Voucher product not found.");
            }

            // Check stock availability in central inventory (only if NOT selling from allocation)
            $sourceType = $data['source_type'] ?? 'own_stock';
            if ($sourceType !== 'allocated_stock') {
                if ($voucherProduct->stock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for voucher: {$voucherProduct->name}. Available: {$voucherProduct->stock}, Requested: {$item['quantity']}");
                }
            }

            // Check allocation availability for finance user
            $hasAllocation = $this->allocationService->validateAllocationAvailability(
                $userId,
                $item['voucher_product_id'],
                $item['quantity']
            );
            if (!$hasAllocation) {
                throw new \Exception("Insufficient allocation for voucher: {$voucherProduct->name}. Please request more stock.");
            }

            $unitPrice = $item['unit_price'] ?? $voucherProduct->price;
            $subtotal = $unitPrice * $item['quantity'];
            $totalAmount += $subtotal;

            $itemsToCreate[] = [
                'voucher_product_id' => $item['voucher_product_id'],
                'qty' => $item['quantity'],
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
                'owner_share' => $voucherProduct->owner_share * $item['quantity'],
                'reseller_fee' => $voucherProduct->reseller_fee * $item['quantity'],
            ];
        }

        // Calculate payment amounts
        $paidAmount = $data['paid_amount'] ?? 0;
        $remainingAmount = $totalAmount - $paidAmount;

        // Determine payment method if not provided
        if (!isset($data['payment_method'])) {
            if ($paidAmount >= $totalAmount) {
                $data['payment_method'] = 'cash';
                $paidAmount = $totalAmount;
                $remainingAmount = 0;
            } elseif ($paidAmount > 0) {
                $data['payment_method'] = 'partial';
            } else {
                $data['payment_method'] = 'credit';
            }
        }

        // Create sale data
        $saleData = [
            'public_id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'business_id' => $business->id,
            'channel_type' => $data['channel_type'],
            'outlet_id' => $data['outlet_id'] ?? null,
            'reseller_id' => $data['reseller_id'] ?? null,
            'source_type' => $data['source_type'] ?? 'own_stock', // Default to own_stock if not provided
            'source_id' => $data['source_id'] ?? $userId,
            'sold_to_type' => $data['sold_to_type'] ?? ($data['channel_type'] === 'admin' ? 'end_user' : $data['channel_type']),
            'sold_to_id' => $data['sold_to_id'] ?? ($data['outlet_id'] ?? $data['reseller_id']),
            'customer_name' => $data['customer_name'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'sold_by_user_id' => $userId,
            'total_amount' => $totalAmount,
            'payment_method' => $data['payment_method'],
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'status' => 'completed',
            'sold_at' => now(),
        ];

        return DB::transaction(function () use ($saleData, $tenantId, $userId, $itemsToCreate) {
            // Create sale
            $sale = $this->voucherSaleRepository->create($saleData);

            // Create sale items and deduct stock
            foreach ($itemsToCreate as $itemData) {
                $itemData['voucher_sale_id'] = $sale->id;
                $this->voucherSaleItemRepository->createMultiple([$itemData]);

                // Deduct stock from central inventory (only if NOT selling from allocation)
                if ($saleData['source_type'] !== 'allocated_stock') {
                    $voucherProduct = $this->voucherProductRepository->findById($itemData['voucher_product_id'], $tenantId);
                    $voucherProduct->stock -= $itemData['qty'];
                    $voucherProduct->save();
                }

                // Deduct from allocation if source is allocated_stock
                if ($saleData['source_type'] === 'allocated_stock') {
                    $this->allocationService->recordSale(
                        $userId,
                        $itemData['voucher_product_id'],
                        $itemData['qty']
                    );
                }
            }

            // TODO: Create journal entries
            // - Debit: Cash/Piutang (based on payment method)
            // - Credit: Revenue

            return $sale->load(['items.voucherProduct', 'outlet', 'reseller', 'soldBy']);
        });
    }

    public function addPayment(string $salePublicId, float $amount, string $businessPublicId, int $tenantId, int $userId, $method = 'cash', $note = null): ?VoucherSale
    {
        $business = $this->businessRepository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            throw new \Exception("Business not found.");
        }

        $sale = $this->voucherSaleRepository->findByPublicId($salePublicId, $business->id);
        if (!$sale) {
            throw new \Exception("Sale not found.");
        }

        if ($amount <= 0) {
            throw new \Exception("Payment amount must be greater than zero.");
        }

        if ($amount > $sale->remaining_amount) {
            throw new \Exception("Payment amount exceeds remaining balance.");
        }

        return DB::transaction(function () use ($sale, $amount, $userId, $method, $note) {
            $this->voucherSaleRepository->addPayment($sale->id, $amount, $userId, $method, $note);

            // TODO: Create journal entry for payment received
            // - Debit: Cash
            // - Credit: Piutang

            return $sale->fresh(['items.voucherProduct', 'outlet', 'reseller', 'soldBy']);
        });
    }
}

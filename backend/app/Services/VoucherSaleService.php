<?php

namespace App\Services;

use App\Repositories\VoucherSaleRepository;
use App\Repositories\VoucherSaleItemRepository;
use App\Repositories\BusinessRepository;
use App\Repositories\IspVoucherProductRepository;
use App\Models\VoucherSale;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class VoucherSaleService
{
    protected $voucherSaleRepository;
    protected $voucherSaleItemRepository;
    protected $businessRepository;
    protected $voucherProductRepository;

    public function __construct(
        VoucherSaleRepository $voucherSaleRepository,
        VoucherSaleItemRepository $voucherSaleItemRepository,
        BusinessRepository $businessRepository,
        IspVoucherProductRepository $voucherProductRepository
    ) {
        $this->voucherSaleRepository = $voucherSaleRepository;
        $this->voucherSaleItemRepository = $voucherSaleItemRepository;
        $this->businessRepository = $businessRepository;
        $this->voucherProductRepository = $voucherProductRepository;
    }

    public function getSalesByBusiness(string $businessPublicId, int $tenantId)
    {
        $business = $this->businessRepository->findByIdPublicId($businessPublicId, $tenantId);
        if (!$business) {
            return null;
        }

        return $this->voucherSaleRepository->findByBusiness($business->id);
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
            $data['outlet_id'] = null;
            $data['reseller_id'] = null;
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

            // Check stock availability
            if ($voucherProduct->stock < $item['quantity']) {
                throw new \Exception("Insufficient stock for voucher: {$voucherProduct->name}. Available: {$voucherProduct->stock}, Requested: {$item['quantity']}");
            }

            $unitPrice = $item['unit_price'] ?? $voucherProduct->price;
            $subtotal = $unitPrice * $item['quantity'];
            $totalAmount += $subtotal;

            $itemsToCreate[] = [
                'voucher_product_id' => $item['voucher_product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
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

        return DB::transaction(function () use ($data, $business, $tenantId, $userId, $totalAmount, $paidAmount, $remainingAmount, $itemsToCreate) {
            // Create sale
            $sale = $this->voucherSaleRepository->create([
                'public_id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'business_id' => $business->id,
                'channel_type' => $data['channel_type'],
                'outlet_id' => $data['outlet_id'] ?? null,
                'reseller_id' => $data['reseller_id'] ?? null,
                'sold_by_user_id' => $userId,
                'total_amount' => $totalAmount,
                'payment_method' => $data['payment_method'],
                'paid_amount' => $paidAmount,
                'remaining_amount' => $remainingAmount,
                'status' => 'completed',
                'sold_at' => now(),
            ]);

            // Create sale items and deduct stock
            foreach ($itemsToCreate as $itemData) {
                $itemData['voucher_sale_id'] = $sale->id;
                $this->voucherSaleItemRepository->createMultiple([$itemData]);

                // Deduct stock
                $voucherProduct = $this->voucherProductRepository->findById($itemData['voucher_product_id'], $tenantId);
                $voucherProduct->stock -= $itemData['quantity'];
                $voucherProduct->save();
            }

            // TODO: Create journal entries
            // - Debit: Cash/Piutang (based on payment method)
            // - Credit: Revenue

            return $sale->load(['items.voucherProduct', 'outlet', 'reseller', 'soldBy']);
        });
    }

    public function addPayment(string $salePublicId, float $amount, string $businessPublicId, int $tenantId): ?VoucherSale
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

        return DB::transaction(function () use ($sale, $amount) {
            $this->voucherSaleRepository->addPayment($sale->id, $amount);

            // TODO: Create journal entry for payment received
            // - Debit: Cash
            // - Credit: Piutang

            return $sale->fresh(['items.voucherProduct', 'outlet', 'reseller', 'soldBy']);
        });
    }
}

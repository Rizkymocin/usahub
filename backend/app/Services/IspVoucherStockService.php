<?php

namespace App\Services;

use App\Models\IspVoucherStock;
use App\Repositories\IspVoucherStockRepository;
use App\Repositories\VoucherPricingRepository;
use Illuminate\Database\Eloquent\Collection;

class IspVoucherStockService
{
    public function __construct(
        private IspVoucherStockRepository $stockRepository,
        private VoucherPricingRepository $pricingRepository
    ) {}

    /**
     * Add new stock
     */
    public function addStock(array $data): IspVoucherStock
    {
        // Validate required fields
        if (!isset($data['business_id'], $data['voucher_product_id'], $data['quantity'], $data['default_selling_price'])) {
            throw new \InvalidArgumentException('Missing required fields');
        }

        if ($data['quantity'] <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0');
        }

        if ($data['default_selling_price'] <= 0) {
            throw new \InvalidArgumentException('Selling price must be greater than 0');
        }

        return $this->stockRepository->create($data);
    }

    /**
     * Get all stocks for a business
     */
    public function getBusinessStocks(int $businessId): Collection
    {
        return $this->stockRepository->findByBusiness($businessId);
    }

    /**
     * Get stock summary for dashboard
     */
    public function getStockSummary(int $businessId): Collection
    {
        return $this->stockRepository->getStockSummary($businessId);
    }

    /**
     * Update stock price
     */
    public function updateStockPrice(int $stockId, float $price): bool
    {
        if ($price <= 0) {
            throw new \InvalidArgumentException('Price must be greater than 0');
        }

        return $this->stockRepository->updatePrice($stockId, $price);
    }

    /**
     * Validate if business has enough stock for allocation
     */
    public function validateStockAvailability(int $businessId, int $voucherProductId, int $quantity): bool
    {
        $available = $this->stockRepository->getAvailableQuantity($businessId, $voucherProductId);
        return $available >= $quantity;
    }

    /**
     * Get available quantity for a product
     */
    public function getAvailableQuantity(int $businessId, int $voucherProductId): int
    {
        return $this->stockRepository->getAvailableQuantity($businessId, $voucherProductId);
    }

    /**
     * Decrement stock quantity (used when approving allocation requests)
     */
    public function decrementStock(int $businessId, int $voucherProductId, int $quantity): void
    {
        if (!$this->validateStockAvailability($businessId, $voucherProductId, $quantity)) {
            throw new \Exception('Insufficient stock available');
        }

        $this->stockRepository->decrementQuantity($businessId, $voucherProductId, $quantity);
    }

    /**
     * Delete stock entry
     */
    public function deleteStock(int $stockId): bool
    {
        $stock = $this->stockRepository->findById($stockId);

        if (!$stock) {
            throw new \Exception('Stock not found');
        }

        // Optionally: check if stock has been allocated
        // For now, we'll allow deletion

        return $this->stockRepository->delete($stockId);
    }

    /**
     * Set pricing for a channel
     */
    public function setPricing(int $businessId, int $voucherProductId, string $channelType, float $price): void
    {
        if (!in_array($channelType, ['reseller', 'outlet', 'end_user'])) {
            throw new \InvalidArgumentException('Invalid channel type');
        }

        if ($price <= 0) {
            throw new \InvalidArgumentException('Price must be greater than 0');
        }

        $this->pricingRepository->upsert($businessId, $voucherProductId, $channelType, $price);
    }

    /**
     * Get pricing for a channel
     */
    public function getPricing(int $businessId, int $voucherProductId, string $channelType): ?float
    {
        return $this->pricingRepository->getPrice($businessId, $voucherProductId, $channelType);
    }

    /**
     * Get all pricing for a business
     */
    public function getBusinessPricing(int $businessId): Collection
    {
        return $this->pricingRepository->findByBusiness($businessId);
    }
}

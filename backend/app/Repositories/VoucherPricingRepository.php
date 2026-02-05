<?php

namespace App\Repositories;

use App\Models\VoucherPricing;
use Illuminate\Database\Eloquent\Collection;

class VoucherPricingRepository
{
    /**
     * Create or update pricing for a channel
     */
    public function upsert(int $businessId, int $voucherProductId, string $channelType, float $price): VoucherPricing
    {
        return VoucherPricing::updateOrCreate(
            [
                'business_id' => $businessId,
                'voucher_product_id' => $voucherProductId,
                'channel_type' => $channelType,
            ],
            [
                'price' => $price,
            ]
        );
    }

    /**
     * Get pricing for a specific product and channel
     */
    public function getPrice(int $businessId, int $voucherProductId, string $channelType): ?float
    {
        $pricing = VoucherPricing::where('business_id', $businessId)
            ->where('voucher_product_id', $voucherProductId)
            ->where('channel_type', $channelType)
            ->first();

        return $pricing?->price;
    }

    /**
     * Get all pricing for a business
     */
    public function findByBusiness(int $businessId): Collection
    {
        return VoucherPricing::where('business_id', $businessId)
            ->with('voucherProduct')
            ->orderBy('voucher_product_id')
            ->orderBy('channel_type')
            ->get();
    }

    /**
     * Get all pricing for a specific product
     */
    public function findByProduct(int $businessId, int $voucherProductId): Collection
    {
        return VoucherPricing::where('business_id', $businessId)
            ->where('voucher_product_id', $voucherProductId)
            ->get();
    }

    /**
     * Delete pricing
     */
    public function delete(int $id): bool
    {
        return VoucherPricing::where('id', $id)->delete();
    }
}

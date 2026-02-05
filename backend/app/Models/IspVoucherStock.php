<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IspVoucherStock extends Model
{
    protected $table = 'isp_voucher_stocks';

    protected $fillable = [
        'tenant_id',
        'business_id',
        'voucher_product_id',
        'quantity',
        'purchase_price',
        'default_selling_price',
        'notes',
        'created_by_user_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'purchase_price' => 'decimal:2',
        'default_selling_price' => 'decimal:2',
    ];

    // Relationships
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function voucherProduct()
    {
        return $this->belongsTo(IspVoucherProduct::class, 'voucher_product_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    // Helper methods
    public function decrementQuantity(int $qty): void
    {
        if ($this->quantity < $qty) {
            throw new \Exception('Insufficient stock quantity');
        }

        $this->decrement('quantity', $qty);
    }

    public function incrementQuantity(int $qty): void
    {
        $this->increment('quantity', $qty);
    }

    public function hasAvailableQuantity(int $qty): bool
    {
        return $this->quantity >= $qty;
    }
}

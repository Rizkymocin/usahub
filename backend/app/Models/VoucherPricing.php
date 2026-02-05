<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherPricing extends Model
{
    protected $table = 'voucher_pricing';

    protected $fillable = [
        'business_id',
        'voucher_product_id',
        'channel_type',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
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
}

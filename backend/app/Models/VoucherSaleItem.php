<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherSaleItem extends Model
{
    protected $fillable = [
        'voucher_sale_id',
        'voucher_product_id',
        'quantity',
        'unit_price',
        'subtotal',
        'owner_share',
        'reseller_fee',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'owner_share' => 'decimal:2',
        'reseller_fee' => 'decimal:2',
    ];

    // Relationships
    public function voucherSale()
    {
        return $this->belongsTo(VoucherSale::class);
    }

    public function voucherProduct()
    {
        return $this->belongsTo(IspVoucherProduct::class, 'voucher_product_id');
    }
}

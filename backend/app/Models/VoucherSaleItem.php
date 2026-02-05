<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherSaleItem extends Model
{
    protected $fillable = [
        'voucher_sale_id',
        'voucher_product_id',
        'qty',
        'unit_price',
        'subtotal',
        'owner_share',
        'reseller_fee',
    ];

    protected $casts = [
        'qty' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
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

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspVoucherProduct extends Model
{
    use HasFactory;

    protected $table = 'isp_voucher_products';

    public $timestamps = true;

    protected $fillable = [
        'public_id',
        'business_id',
        'name',
        'duration_value',
        'duration_unit',
        'selling_price',
        'owner_share',
        'reseller_fee',
    ];

    protected $casts = [
        'selling_price' => 'decimal:2',
        'owner_share' => 'decimal:2',
        'reseller_fee' => 'decimal:2',
    ];

    protected $hidden = [
        'id',
        'business_id',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function saleItems()
    {
        return $this->hasMany(VoucherSaleItem::class, 'voucher_product_id');
    }
}

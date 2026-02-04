<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VoucherStockRequestItem extends Model
{
    use HasFactory;

    protected $table = 'voucher_stock_request_items';

    protected $fillable = [
        'stock_request_id',
        'voucher_product_id',
        'qty',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function stockRequest()
    {
        return $this->belongsTo(VoucherStockRequest::class, 'stock_request_id');
    }

    public function voucherProduct()
    {
        return $this->belongsTo(IspVoucherProduct::class, 'voucher_product_id');
    }

    public function voucher_product()
    {
        return $this->belongsTo(IspVoucherProduct::class, 'voucher_product_id');
    }
}

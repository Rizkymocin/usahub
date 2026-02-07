<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IspVoucherStockAdjustment extends Model
{
    protected $table = 'isp_voucher_stock_adjustments';

    protected $fillable = [
        'tenant_id',
        'business_id',
        'voucher_product_id',
        'quantity',
        'adjustment_type',
        'source_type',
        'source_id',
        'notes',
        'attachment_path',
        'created_by_user_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'source_id' => 'integer',
        'created_by_user_id' => 'integer',
    ];

    // Relationships
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function voucherProduct()
    {
        return $this->belongsTo(IspVoucherProduct::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    // Polymorphic specific relations if needed, but given source_id is simpler here:
    public function stock()
    {
        return $this->belongsTo(IspVoucherStock::class, 'source_id');
    }

    public function allocation()
    {
        return $this->belongsTo(VoucherStockAllocation::class, 'source_id');
    }
}

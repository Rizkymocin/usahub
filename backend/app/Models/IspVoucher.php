<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspVoucher extends Model
{
    use HasFactory;

    protected $table = 'isp_vouchers';

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'voucher_product_id',
        'outlet_id',
        'code',
        'status',
        'generated_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function voucherProduct()
    {
        return $this->belongsTo(IspVoucherProduct::class, 'voucher_product_id');
    }

    public function outlet()
    {
        return $this->belongsTo(IspOutlet::class);
    }
}

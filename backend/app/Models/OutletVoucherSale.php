<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OutletVoucherSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'reseller_id',
        'voucher_id',
        'selling_price',
        'reseller_fee',
        'owner_share',
        'status',
        'sold_at',
    ];

    protected $casts = [
        'sold_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function outlet()
    {
        return $this->belongsTo(IspOutlet::class);
    }

    public function reseller()
    {
        return $this->belongsTo(IspReseller::class);
    }

    public function voucher()
    {
        return $this->belongsTo(IspVoucher::class);
    }
}

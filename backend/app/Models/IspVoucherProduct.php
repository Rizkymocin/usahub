<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspVoucherProduct extends Model
{
    use HasFactory;

    protected $table = 'isp_voucher_products';

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'name',
        'duration_value',
        'duration_unit',
        'selling_price',
        'owner_share',
        'reseller_fee',
        'is_active',
        'created_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}

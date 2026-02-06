<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherSalePayment extends Model
{
    protected $fillable = [
        'voucher_sale_id',
        'amount',
        'payment_method',
        'note',
        'collected_by_user_id',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function voucherSale()
    {
        return $this->belongsTo(VoucherSale::class);
    }

    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by_user_id');
    }
}

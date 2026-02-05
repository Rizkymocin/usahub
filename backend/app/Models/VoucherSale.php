<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherSale extends Model
{
    protected $fillable = [
        'public_id',
        'tenant_id',
        'business_id',
        'channel_type',
        'outlet_id',
        'reseller_id',
        'sold_by_user_id',
        'source_type',
        'source_id',
        'sold_to_type',
        'sold_to_id',
        'customer_name',
        'customer_phone',
        'total_amount',
        'payment_method',
        'paid_amount',
        'remaining_amount',
        'status',
        'sold_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'sold_at' => 'datetime',
    ];

    // Relationships
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function outlet()
    {
        return $this->belongsTo(IspOutlet::class, 'outlet_id');
    }

    public function reseller()
    {
        return $this->belongsTo(IspReseller::class, 'reseller_id');
    }

    public function soldBy()
    {
        return $this->belongsTo(User::class, 'sold_by_user_id');
    }

    public function items()
    {
        return $this->hasMany(VoucherSaleItem::class);
    }

    // Accessor for payment status
    public function getPaymentStatusAttribute()
    {
        if ($this->remaining_amount == 0) {
            return 'paid';
        } elseif ($this->paid_amount > 0) {
            return 'partial';
        }
        return 'unpaid';
    }

    // Method to add payment
    public function addPayment(float $amount)
    {
        $this->paid_amount += $amount;
        $this->remaining_amount = max(0, $this->total_amount - $this->paid_amount);
        $this->save();
    }
}

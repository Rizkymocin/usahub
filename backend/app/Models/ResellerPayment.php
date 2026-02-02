<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResellerPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'outlet_id',
        'reseller_invoice_id',
        'amount',
        'payment_method',
        'paid_at',
        'created_by_user_id',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

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

    public function invoice()
    {
        return $this->belongsTo(ResellerInvoice::class, 'reseller_invoice_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}

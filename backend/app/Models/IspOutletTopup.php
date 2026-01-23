<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspOutletTopup extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_id',
        'tenant_id',
        'business_id',
        'outlet_id',
        'amount',
        'payment_method',
        'reference_no',
        'topup_date',
        'created_by_user_id',
    ];

    protected $casts = [
        'topup_date' => 'datetime',
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

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}

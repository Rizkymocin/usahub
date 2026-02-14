<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IspPurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_id',
        'tenant_id',
        'business_id',
        'purchase_date',
        'type',
        'total_amount',
        'supplier_name',
        'invoice_number',
        'notes',
        'created_by_user_id',
    ];

    protected $casts = [
        'purchase_date' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(IspPurchaseItem::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}

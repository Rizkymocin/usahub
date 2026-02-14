<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IspPurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'isp_purchase_id',
        'item_name',
        'quantity',
        'unit',
        'unit_price',
        'subtotal',
        'isp_maintenance_item_id',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function purchase()
    {
        return $this->belongsTo(IspPurchase::class, 'isp_purchase_id');
    }

    public function maintenanceItem()
    {
        return $this->belongsTo(IspMaintenanceItem::class, 'isp_maintenance_item_id');
    }
}

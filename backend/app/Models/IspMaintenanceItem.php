<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspMaintenanceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'name',
        'unit',
        'stock',
        'price',
    ];

    protected $casts = [
        'stock' => 'integer',
        'price' => 'decimal:2',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}

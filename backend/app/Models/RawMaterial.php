<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RawMaterial extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'business_id',
        'unit_id',
        'name',
        'stock',
        'cost_per_unit',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}

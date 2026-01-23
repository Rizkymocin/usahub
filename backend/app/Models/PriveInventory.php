<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PriveInventory extends Model
{
    use HasFactory;

    protected $table = 'prive_inventory';

    public $timestamps = false;

    protected $fillable = [
        'business_id',
        'raw_material_id',
        'qty',
        'note',
        'created_at',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function rawMaterial()
    {
        return $this->belongsTo(RawMaterial::class);
    }
}

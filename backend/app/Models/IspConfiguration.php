<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IspConfiguration extends Model
{
    use HasFactory;

    protected $table = 'isp_configurations';

    protected $fillable = [
        'business_id',
        'key',
        'value',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}

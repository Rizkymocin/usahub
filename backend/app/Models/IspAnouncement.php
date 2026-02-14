<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IspAnouncement extends Model
{
    protected $fillable = [
        'public_id',
        'business_id',
        'title',
        'content',
        'type',
        'status',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}

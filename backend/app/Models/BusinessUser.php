<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessUser extends Model
{
    protected $fillable = [
        'business_id',
        'user_id',
        'tenant_id',
        'is_active',
        'joined_at',
    ];

    protected $hidden = [
        'id',
        'business_id',
        'user_id',
        'tenant_id',
        'is_active',
        'joined_at',
    ];
}

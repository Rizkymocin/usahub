<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspOutlet extends Model
{
    use HasFactory;

    protected $table = 'isp_outlets';

    public $timestamps = false;

    protected $fillable = [
        'public_id',
        'tenant_id',
        'business_id',
        'user_id',
        'name',
        'phone',
        'address',
        'current_balance',
        'status',
        'created_at',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    protected $hidden = [
        'tenant_id',
        'business_id',
        'user_id',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

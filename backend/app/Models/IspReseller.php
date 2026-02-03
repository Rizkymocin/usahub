<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspReseller extends Model
{
    use HasFactory;

    protected $table = 'isp_resellers';

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'code',
        'name',
        'phone',
        'address',
        'is_active',
        'created_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'id',
        'tenant_id',
        'outlet_id',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function outlet()
    {
        return $this->belongsTo(IspOutlet::class);
    }
}

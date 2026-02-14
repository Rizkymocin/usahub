<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspReseller extends Model
{
    use HasFactory, \Spatie\Activitylog\Traits\LogsActivity;

    protected $table = 'isp_resellers';

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'outlet_id',
        'code',
        'name',
        'phone',
        'address',
        'latitude',
        'longitude',
        'is_active',
        'created_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'tenant_id',
        'business_id',
        'outlet_id',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function outlet()
    {
        return $this->belongsTo(IspOutlet::class);
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Business extends Model
{
    use HasFactory, \Spatie\Activitylog\Traits\LogsActivity;

    protected $fillable = [
        'public_id',
        'tenant_id',
        'name',
        'category',
        'address',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'tenant_id',
        'id'
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'business_users'
        )->withPivot(['tenant_id', 'is_active', 'joined_at'])
            ->withTimestamps();
    }

    public function outlets()
    {
        return $this->hasMany(IspOutlet::class);
    }

    public function resellers()
    {
        return $this->hasManyThrough(IspReseller::class, IspOutlet::class, 'business_id', 'outlet_id');
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class IspProspect extends Model
{
    use HasFactory;

    protected $table = 'isp_prospects';

    protected $fillable = [
        'public_id',
        'business_id',
        'outlet_id',
        'sales_id',
        'name',
        'phone',
        'address',
        'latitude',
        'longitude',
        'status',
        'admin_note',
        'technician_note',
        'approved_by',
        'approved_at',
        'installed_at',
        'activated_at',
        'maintenance_issue_id',
        'assigned_technician_id',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'installed_at' => 'datetime',
        'activated_at' => 'datetime',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    protected $hidden = [
        'business_id',
        'outlet_id',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->public_id)) {
                $model->public_id = Str::uuid();
            }
        });
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(IspOutlet::class, 'outlet_id');
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function maintenanceIssue(): BelongsTo
    {
        return $this->belongsTo(IspMaintenanceIssue::class, 'maintenance_issue_id');
    }

    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function readinessConfirmations(): HasMany
    {
        return $this->hasMany(IspInstallationReadiness::class, 'prospect_id');
    }
}

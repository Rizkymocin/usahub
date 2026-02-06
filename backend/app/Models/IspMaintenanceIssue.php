<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class IspMaintenanceIssue extends Model
{
    use HasFactory;

    protected $table = 'isp_maintenance_issues';

    protected $fillable = [
        'public_id',
        'business_id',
        'reseller_id',
        'outlet_id',
        'reporter_id',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'assigned_technician_id',
        'reported_at',
        'resolved_at',
    ];

    protected $casts = [
        'reported_at' => 'datetime',
        'resolved_at' => 'datetime',
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

    public function reseller(): BelongsTo
    {
        return $this->belongsTo(IspReseller::class, 'reseller_id');
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(IspOutlet::class, 'outlet_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(IspMaintenanceLog::class, 'issue_id');
    }
}

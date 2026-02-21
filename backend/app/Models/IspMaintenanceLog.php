<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class IspMaintenanceLog extends Model
{
    use HasFactory;

    protected $table = 'isp_maintenance_logs';

    protected $fillable = [
        'public_id',
        'issue_id',
        'technician_id',
        'action_taken',
        'result',
        'notes',
        'photos',
    ];

    protected $casts = [
        'photos' => 'array',
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

    public function issue(): BelongsTo
    {
        return $this->belongsTo(IspMaintenanceIssue::class, 'issue_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function items()
    {
        return $this->belongsToMany(IspMaintenanceItem::class, 'isp_maintenance_log_items', 'log_id', 'item_id')
            ->withPivot('quantity', 'notes');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'isp_maintenance_log_participants', 'log_id', 'user_id');
    }
}

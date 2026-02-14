<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class IspTaskExpense extends Model
{
    use HasFactory;

    protected $table = 'isp_task_expenses';

    protected $fillable = [
        'public_id',
        'maintenance_issue_id',
        'user_id',
        'category',
        'amount',
        'description',
        'receipt_photo',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
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

    public function maintenanceIssue(): BelongsTo
    {
        return $this->belongsTo(IspMaintenanceIssue::class, 'maintenance_issue_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

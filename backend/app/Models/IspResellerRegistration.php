<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class IspResellerRegistration extends Model
{
    use HasFactory;

    protected $table = 'isp_reseller_registrations';

    protected $fillable = [
        'public_id',
        'business_id',
        'reseller_id',
        'sales_id',
        'status',
        'amount',
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
        return $this->belongsTo(IspReseller::class);
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_id');
    }
}

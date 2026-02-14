<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IspInstallationReadiness extends Model
{
    protected $table = 'isp_installation_readiness';

    protected $fillable = [
        'prospect_id',
        'user_id',
        'confirmed_at',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(IspProspect::class, 'prospect_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

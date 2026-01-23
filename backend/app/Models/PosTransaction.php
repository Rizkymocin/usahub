<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PosTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'pos_code_id',
        'user_id',
        'total_price',
        'total_cost',
        'payment_method',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function posCode()
    {
        return $this->belongsTo(PosCode::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

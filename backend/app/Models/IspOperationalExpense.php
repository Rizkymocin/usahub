<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspOperationalExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'category_id',
        'description',
        'amount',
        'expense_date',
        'created_by_user_id',
    ];

    protected $casts = [
        'expense_date' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function category()
    {
        return $this->belongsTo(OperationCategory::class, 'category_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}

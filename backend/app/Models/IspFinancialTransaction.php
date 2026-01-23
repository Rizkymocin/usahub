<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IspFinancialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_id',
        'tenant_id',
        'business_id',
        'journal_entry_id',
        'type',
        'source_type',
        'source_id',
        'amount',
        'transaction_date',
        'created_by_user_id',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}

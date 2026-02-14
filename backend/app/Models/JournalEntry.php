<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'accounting_period_id',
        'source_type',
        'source_id',
        'journal_date',
        'event_code',
        'description',
        'context_json',
    ];

    protected $casts = [
        'journal_date' => 'datetime',
        'context_json' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function period()
    {
        return $this->belongsTo(AccountingPeriod::class, 'accounting_period_id');
    }

    public function journalLines()
    {
        return $this->hasMany(JournalLine::class);
    }
}

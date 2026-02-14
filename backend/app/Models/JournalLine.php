<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JournalLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'direction',
        'amount',
        'finance_user_id',
        'channel_type',
        'channel_id',
        'customer_id',
    ];

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function financeUser()
    {
        return $this->belongsTo(User::class, 'finance_user_id');
    }

    public function customer()
    {
        return $this->belongsTo(IspReseller::class, 'customer_id');
    }
}

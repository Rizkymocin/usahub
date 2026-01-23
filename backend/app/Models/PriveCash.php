<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PriveCash extends Model
{
    use HasFactory;

    protected $table = 'prive_cash';

    public $timestamps = false;

    protected $fillable = [
        'business_id',
        'amount',
        'note',
        'created_at',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}

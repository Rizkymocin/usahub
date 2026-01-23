<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResellerInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'reseller_id',
        'invoice_number',
        'period_start',
        'period_end',
        'total_amount',
        'status',
        'issued_at',
        'paid_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end'   => 'date',
        'issued_at'    => 'datetime',
        'paid_at'      => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function outlet()
    {
        return $this->belongsTo(IspOutlet::class);
    }

    public function reseller()
    {
        return $this->belongsTo(IspReseller::class);
    }
}

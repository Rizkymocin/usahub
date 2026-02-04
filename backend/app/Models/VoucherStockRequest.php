<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VoucherStockRequest extends Model
{
    use HasFactory;

    protected $table = 'voucher_stock_requests';

    protected $fillable = [
        'tenant_id',
        'business_id',
        'requested_by_user_id',
        'outlet_id',
        'total_amount',
        'status',
        'requested_at',
        'processed_at',
        'processed_by_user_id',
        'request_note',
        'process_note',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    */

    public function approve(User $user, ?string $note = null): void
    {
        $this->update([
            'status' => 'approved',
            'processed_at' => now(),
            'processed_by_user_id' => $user->id,
            'process_note' => $note,
        ]);
    }

    public function reject(User $user, ?string $note = null): void
    {
        $this->update([
            'status' => 'rejected',
            'processed_at' => now(),
            'processed_by_user_id' => $user->id,
            'process_note' => $note,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    public function outlet()
    {
        return $this->belongsTo(IspOutlet::class);
    }

    public function items()
    {
        return $this->hasMany(VoucherStockRequestItem::class, 'stock_request_id');
    }
}

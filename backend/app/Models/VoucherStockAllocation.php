<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class VoucherStockAllocation extends Model
{
    use HasFactory;

    protected $table = 'voucher_stock_allocations';

    protected $appends = ['qty_available'];

    protected $fillable = [
        'tenant_id',
        'business_id',
        'allocated_to_user_id',
        'voucher_product_id',
        'qty_allocated',
        'qty_sold',
        'source_type',
        'source_id',
        'status',
        'allocated_at',
        'allocated_by_user_id',
        'closed_at',
        'notes',
    ];

    protected $casts = [
        'allocated_at' => 'datetime',
        'closed_at' => 'datetime',
        'qty_allocated' => 'integer',
        'qty_sold' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Computed Attributes
    |--------------------------------------------------------------------------
    */

    /**
     * Get available quantity (allocated - sold)
     */
    public function getQtyAvailableAttribute(): int
    {
        if (array_key_exists('qty_available', $this->attributes)) {
            return (int) $this->attributes['qty_available'];
        }

        return (int) (($this->qty_allocated ?? 0) - ($this->qty_sold ?? 0));
    }

    /*
    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Increment the qty_sold by given quantity
     */
    public function incrementSold(int $quantity): void
    {
        $this->increment('qty_sold', $quantity);

        // Auto-close if fully sold
        if ($this->qty_sold >= $this->qty_allocated) {
            $this->close();
        }
    }

    /**
     * Close this allocation
     */
    public function close(): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }

    /**
     * Check if allocation has available stock
     */
    public function isAvailable(): bool
    {
        return $this->status === 'active' && $this->qty_available > 0;
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

    public function allocatedTo()
    {
        return $this->belongsTo(User::class, 'allocated_to_user_id');
    }

    public function voucherProduct()
    {
        return $this->belongsTo(IspVoucherProduct::class, 'voucher_product_id');
    }

    public function allocatedBy()
    {
        return $this->belongsTo(User::class, 'allocated_by_user_id');
    }

    public function stockRequest()
    {
        return $this->belongsTo(VoucherStockRequest::class, 'source_id');
    }
}

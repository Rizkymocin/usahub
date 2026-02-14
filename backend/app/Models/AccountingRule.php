<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'business_id',
        'event_code',
        'rule_name',
        'priority',
        'condition_json',
        'account_id',
        'direction',
        'amount_source',
        'collector_required',
        'is_active',
    ];

    protected $casts = [
        'condition_json' => 'array',
        'collector_required' => 'boolean',
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    /**
     * Get the tenant that owns the rule
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the business that owns the rule
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get the account for this rule
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Scope to get active rules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get rules for a specific event
     */
    public function scopeForEvent($query, string $eventCode)
    {
        return $query->where('event_code', $eventCode);
    }

    /**
     * Scope to get rules for a specific business
     */
    public function scopeForBusiness($query, int $businessId)
    {
        return $query->where('business_id', $businessId);
    }

    /**
     * Check if this rule matches the given payload
     */
    public function matches(array $payload): bool
    {
        $conditions = $this->condition_json ?? [];

        // Empty condition always matches
        if (empty($conditions)) {
            return true;
        }

        // All conditions must match (AND logic)
        foreach ($conditions as $key => $value) {
            if (!isset($payload[$key]) || $payload[$key] !== $value) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the amount from payload based on amount_source
     */
    public function resolveAmount(array $payload): float
    {
        $source = $this->amount_source;

        if (!isset($payload[$source])) {
            throw new \InvalidArgumentException("Missing amount source: {$source}");
        }

        return (float) $payload[$source];
    }
}

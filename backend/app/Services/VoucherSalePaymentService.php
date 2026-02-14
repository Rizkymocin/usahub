<?php

namespace App\Services;

use App\Models\VoucherSale;
use App\Models\VoucherSalePayment;
use App\Services\AccountingRuleEngine;
use Illuminate\Support\Facades\DB;

class VoucherSalePaymentService
{
    protected $accountingRuleEngine;

    public function __construct(AccountingRuleEngine $accountingRuleEngine)
    {
        $this->accountingRuleEngine = $accountingRuleEngine;
    }

    /**
     * Record a payment for a voucher sale and create journal entry
     */
    public function recordPayment(
        VoucherSale $sale,
        float $amount,
        int $userId,
        string $paymentMethod = 'cash',
        ?string $note = null
    ): VoucherSalePayment {
        return DB::transaction(function () use ($sale, $amount, $userId, $paymentMethod, $note) {
            // Update sale amounts
            $sale->paid_amount += $amount;
            $sale->remaining_amount = max(0, $sale->total_amount - $sale->paid_amount);
            $sale->save();

            // Create payment record
            $payment = $sale->payments()->create([
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'note' => $note,
                'collected_by_user_id' => $userId,
                'paid_at' => now(),
            ]);

            // Emit journal entry event
            $this->accountingRuleEngine->emitEvent([
                'event_code' => 'EVT_RECEIVABLE_COLLECTED',
                'ref_type' => 'voucher_sale_payment',
                'ref_id' => $payment->id,
                'occurred_at' => $payment->paid_at,
                'actor' => [
                    'user_id' => $userId,
                    'channel_type' => 'admin',
                ],
                'payload' => [
                    'paid_amount' => $amount,
                    'customer_id' => $sale->reseller_id ?? $sale->outlet_id,
                    'sale_id' => $sale->id,
                ],
                'tenant_id' => $sale->tenant_id,
                'business_id' => $sale->business_id,
            ]);

            return $payment;
        });
    }
}

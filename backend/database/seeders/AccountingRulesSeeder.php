<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountingRulesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants to seed rules for each
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            // Get all businesses for this tenant
            $businesses = DB::table('businesses')
                ->where('tenant_id', $tenant->id)
                ->get();

            foreach ($businesses as $business) {
                // Get account IDs for this business
                $accounts = $this->getAccountIds($business->id);

                if (empty($accounts)) {
                    echo "Skipping business {$business->name} - missing required accounts\n";
                    continue; // Skip if no accounts found
                }

                // Seed rules for this business
                $this->seedRulesForBusiness($tenant->id, $business->id, $accounts);
                echo "✅ Seeded accounting rules for business: {$business->name}\n";
            }
        }
    }

    /**
     * Get account IDs by code for a business
     */
    private function getAccountIds(int $businessId): array
    {
        $accountCodes = ['1010', '1030', '1050', '2010', '2020', '2030', '4010', '5010', '5020'];
        $accounts = [];

        foreach ($accountCodes as $code) {
            $account = DB::table('accounts')
                ->where('business_id', $businessId)
                ->where('code', $code)
                ->first();

            if ($account) {
                $accounts[$code] = $account->id;
            }
        }

        return $accounts;
    }

    /**
     * Seed accounting rules for a business
     */
    private function seedRulesForBusiness(int $tenantId, int $businessId, array $accounts): void
    {
        $rules = [
            // EVT_VOUCHER_SOLD - Cash (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - cash (debit)',
                'priority' => 1,
                'condition_json' => json_encode(['payment_type' => 'cash']),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode(['payment_type' => 'cash']),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_VOUCHER_SOLD - Credit (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - credit (debit)',
                'priority' => 3,
                'condition_json' => json_encode(['payment_type' => 'credit']),
                'account_id' => $accounts['1030'], // Piutang
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - credit (credit)',
                'priority' => 4,
                'condition_json' => json_encode(['payment_type' => 'credit']),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_VOUCHER_SOLD - Partial Cash (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - partial cash (debit)',
                'priority' => 5,
                'condition_json' => json_encode(['payment_type' => 'partial']),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'cash_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - partial cash (credit)',
                'priority' => 6,
                'condition_json' => json_encode(['payment_type' => 'partial']),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'cash_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_VOUCHER_SOLD - Partial Credit (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - partial credit (debit)',
                'priority' => 7,
                'condition_json' => json_encode(['payment_type' => 'partial']),
                'account_id' => $accounts['1030'], // Piutang
                'direction' => 'DEBIT',
                'amount_source' => 'credit_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_SOLD',
                'rule_name' => 'Voucher sold - partial credit (credit)',
                'priority' => 8,
                'condition_json' => json_encode(['payment_type' => 'partial']),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'credit_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_RECEIVABLE_COLLECTED (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_RECEIVABLE_COLLECTED',
                'rule_name' => 'Receivable collected (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'paid_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_RECEIVABLE_COLLECTED',
                'rule_name' => 'Receivable collected (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1030'], // Piutang
                'direction' => 'CREDIT',
                'amount_source' => 'paid_amount',
                'collector_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_PURCHASE_PAID - Expense (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase expense paid (debit)',
                'priority' => 1,
                'condition_json' => json_encode(['purchase_category' => 'expense']),
                'account_id' => $accounts['5010'], // Beban Maintenance
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase expense paid (credit)',
                'priority' => 2,
                'condition_json' => json_encode(['purchase_category' => 'expense']),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_PURCHASE_PAID - Asset (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase asset paid (debit)',
                'priority' => 3,
                'condition_json' => json_encode(['purchase_category' => 'asset']),
                'account_id' => $accounts['1050'], // Peralatan Jaringan
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PURCHASE_PAID',
                'rule_name' => 'Purchase asset paid (credit)',
                'priority' => 4,
                'condition_json' => json_encode(['purchase_category' => 'asset']),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_PURCHASE_ON_CREDIT (2 rules)
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PURCHASE_ON_CREDIT',
                'rule_name' => 'Purchase on credit (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5010'], // Beban Maintenance
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PURCHASE_ON_CREDIT',
                'rule_name' => 'Purchase on credit (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['2010'], // Utang Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_VOUCHER_PREPAID - Payment received, vouchers not delivered yet
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_PREPAID',
                'rule_name' => 'Prepaid voucher - cash received (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'paid_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_PREPAID',
                'rule_name' => 'Prepaid voucher - unearned revenue (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['2030'], // Pendapatan Diterima Dimuka
                'direction' => 'CREDIT',
                'amount_source' => 'paid_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_VOUCHER_DELIVERED - Vouchers delivered, recognize revenue
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_DELIVERED',
                'rule_name' => 'Voucher delivered - unearned revenue (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['2030'], // Pendapatan Diterima Dimuka
                'direction' => 'DEBIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_VOUCHER_DELIVERED',
                'rule_name' => 'Voucher delivered - revenue recognition (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['4010'], // Penjualan Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'total_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_REGISTRATION_APPROVED (2 rules) - Sales Commission
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_REGISTRATION_APPROVED',
                'rule_name' => 'Registration approved - commission expense (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5020'], // Biaya Komisi Sales
                'direction' => 'DEBIT',
                'amount_source' => 'commission_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_REGISTRATION_APPROVED',
                'rule_name' => 'Registration approved - commission payable (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['2020'], // Hutang Komisi
                'direction' => 'CREDIT',
                'amount_source' => 'commission_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('accounting_rules')->insert($rules);
    }
}

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
        $accountCodes = [
            '1010',
            '1030',
            '1040',
            '1050',
            '2010',
            '2020',
            '2030',
            '2040',
            '3010',
            '3020',
            '3030',
            '4010',
            '5010',
            '5020',
            '5070',
            '5080',
            '5090',
            '5100',
            '5110',
        ];
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

            // EVT_EXPENSE_LOGGED (2 rules) - Personal Expense/Reimburse
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_EXPENSE_LOGGED',
                'rule_name' => 'Expense logged - maintenance cost (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5010'], // Biaya Pemeliharaan
                'direction' => 'DEBIT',
                'amount_source' => 'expense_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_EXPENSE_LOGGED',
                'rule_name' => 'Expense logged - reimbursement liability (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['2040'], // Prefer Hutang Operasional, fallback to Utang Voucher
                'direction' => 'CREDIT',
                'amount_source' => 'expense_amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_PRIVE - Owner withdraws funds
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PRIVE',
                'rule_name' => 'Prive - retained earnings (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['3020'], // Laba Ditahan
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_PRIVE',
                'rule_name' => 'Prive - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_EQUITY_INVESTED - Owner invests capital
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_EQUITY_INVESTED',
                'rule_name' => 'Owner equity invested - cash (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_EQUITY_INVESTED',
                'rule_name' => 'Owner equity invested - capital (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['3010'], // Modal Pemilik
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_INVESTOR_EQUITY - Third-party investor equity
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_INVESTOR_EQUITY',
                'rule_name' => 'Investor equity - cash (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_INVESTOR_EQUITY',
                'rule_name' => 'Investor equity - shares (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['3030'], // Saham Pihak Ketiga
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_TAX_PAID_PPH - PPh Tax Payment
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_TAX_PAID_PPH',
                'rule_name' => 'PPh tax paid - expense (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5070'], // Pajak Perusahaan (PPh)
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_TAX_PAID_PPH',
                'rule_name' => 'PPh tax paid - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_TAX_PAID_ISP - ISP Tax Payment
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_TAX_PAID_ISP',
                'rule_name' => 'ISP tax paid - expense (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5080'], // Pajak ISP
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_TAX_PAID_ISP',
                'rule_name' => 'ISP tax paid - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_SIMPANAN_POKOK - Simpanan Pokok Koperasi
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_SIMPANAN_POKOK',
                'rule_name' => 'Simpanan pokok - expense (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5090'], // Simpanan Pokok Koperasi
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_SIMPANAN_POKOK',
                'rule_name' => 'Simpanan pokok - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_SIMPANAN_WAJIB - Simpanan Wajib Koperasi
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_SIMPANAN_WAJIB',
                'rule_name' => 'Simpanan wajib - expense (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5100'], // Simpanan Wajib Koperasi
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_SIMPANAN_WAJIB',
                'rule_name' => 'Simpanan wajib - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EVT_IURAN_KOPERASI - Iuran Koperasi
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_IURAN_KOPERASI',
                'rule_name' => 'Iuran koperasi - expense (debit)',
                'priority' => 1,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['5110'], // Iuran Koperasi
                'direction' => 'DEBIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tenant_id' => $tenantId,
                'business_id' => $businessId,
                'event_code' => 'EVT_IURAN_KOPERASI',
                'rule_name' => 'Iuran koperasi - cash (credit)',
                'priority' => 2,
                'condition_json' => json_encode([]),
                'account_id' => $accounts['1010'], // Kas
                'direction' => 'CREDIT',
                'amount_source' => 'amount',
                'collector_required' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('accounting_rules')->insert($rules);
    }
}

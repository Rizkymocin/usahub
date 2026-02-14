<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\AccountingRulesSeeder;

class SeedAccountingRules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'accounting:seed-rules';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed accounting rules for all existing businesses';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding accounting rules for all businesses...');
        
        $seeder = new AccountingRulesSeeder();
        $seeder->run();
        
        $this->info('✅ Accounting rules seeded successfully!');
        
        return Command::SUCCESS;
    }
}

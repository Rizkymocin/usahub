<?php

namespace App\Repositories;

use App\Models\Account;
use Illuminate\Database\Eloquent\Collection;

class AccountRepository
{
    public function getByBusiness(int $businessId): Collection
    {
        return Account::where('business_id', $businessId)
            ->orderBy('code', 'asc')
            ->get();
    }

    public function create(array $data): Account
    {
        return Account::create($data);
    }

    public function findById(int $id): ?Account
    {
        return Account::find($id);
    }

    public function delete(int $id): bool
    {
        return Account::destroy($id) > 0;
    }
}

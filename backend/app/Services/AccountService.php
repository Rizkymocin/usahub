<?php

namespace App\Services;

use App\Repositories\AccountRepository;
use App\Models\Account;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class AccountService
{
    public $repository;

    public function __construct(AccountRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getBusinessAccounts(int $businessId): Collection
    {
        return $this->repository->getByBusiness($businessId);
    }

    public function createAccount(array $data, int $businessId, int $tenantId): Account
    {
        // Add calculated fields
        $data['public_id'] = (string) Str::uuid();
        $data['business_id'] = $businessId;
        $data['tenant_id'] = $tenantId;
        $data['is_active'] = true;

        // If parent_id is provided, ensure it belongs to the same business
        if (isset($data['parent_id'])) {
            $parent = $this->repository->findById($data['parent_id']);
            if (!$parent || $parent->business_id !== $businessId) {
                throw new \Exception("Induk akun tidak valid.");
            }
            // Inherit type from parent
            $data['type'] = $parent->type;
        }

        return $this->repository->create($data);
    }

    public function deleteAccount(int $id, int $businessId, int $tenantId): void
    {
        $account = $this->repository->findById($id);

        if (!$account) {
            throw new \Exception("Akun tidak ditemukan.");
        }

        if ($account->business_id !== $businessId || $account->tenant_id !== $tenantId) {
            throw new \Exception("Unauthorized access to account.");
        }

        if ($account->parent_id === null) {
            throw new \Exception("Akun utama (root) tidak dapat dihapus.");
        }

        $childCount = \App\Models\Account::where('parent_id', $id)->count();
        if ($childCount > 0) {
            throw new \Exception("Akun tidak dapat dihapus karena memiliki sub-akun.");
        }

        $this->repository->delete($id);
    }
}

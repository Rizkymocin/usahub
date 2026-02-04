<?php

namespace App\Services;

use App\Repositories\IspVoucherProductRepository;
use App\Models\Business;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class IspVoucherService
{
    private IspVoucherProductRepository $repository;

    public function __construct(IspVoucherProductRepository $repository)
    {
        $this->repository = $repository;
    }

    private function getBusiness(string $publicId, Request $request): ?Business
    {
        $user = $request->user();
        if (!$user) return null;

        if ($user->tenant) {
            return Business::where('public_id', $publicId)->where('tenant_id', $user->tenant->id)->first();
        }

        // Logic for other users if needed
        return $user->businesses()->where('businesses.public_id', $publicId)->first();
    }

    public function getBusinessVoucherProducts(string $businessPublicId, Request $request): ?Collection
    {
        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            return null;
        }

        return $this->repository->findByBusiness($business->id);
    }

    public function createVoucherProduct(string $businessPublicId, Request $request, array $data)
    {
        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            throw new \Exception("Business not found");
        }

        $data['business_id'] = $business->id;

        if (!isset($data['public_id'])) {
            $data['public_id'] = (string) \Illuminate\Support\Str::uuid();
        }

        return $this->repository->create($data);
    }
    public function deleteVoucherProduct(string $businessPublicId, Request $request, string $voucherPublicId)
    {
        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            throw new \Exception("Business not found");
        }

        return $this->repository->delete($voucherPublicId, $business->id);
    }
}

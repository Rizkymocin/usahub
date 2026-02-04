<?php

namespace App\Services;

use App\Repositories\VoucherStockRequestRepository;
use App\Repositories\VoucherStockRequestItemRepository;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\IspVoucherProduct;
use App\Models\IspOutlet;

class VoucherStockRequestService
{
    private VoucherStockRequestRepository $requestRepo;
    private VoucherStockRequestItemRepository $itemRepo;

    public function __construct(
        VoucherStockRequestRepository $requestRepo,
        VoucherStockRequestItemRepository $itemRepo
    ) {
        $this->requestRepo = $requestRepo;
        $this->itemRepo = $itemRepo;
    }

    /**
     * Get business by public_id with authorization check
     */
    private function getBusiness(string $publicId, Request $request): ?Business
    {
        $user = $request->user();
        if (!$user) return null;

        if ($user->tenant) {
            return Business::where('public_id', $publicId)
                ->where('tenant_id', $user->tenant->id)
                ->first();
        }

        return $user->businesses()
            ->where('businesses.public_id', $publicId)
            ->first();
    }

    /**
     * Create stock request (Finance role)
     */
    public function createStockRequest(string $businessPublicId, Request $request, array $data)
    {
        $user = $request->user();
        if (!$user) {
            throw new \Exception("Unauthorized");
        }

        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            throw new \Exception("Business not found");
        }

        // Resolve outlet
        $outletId = null;
        if (!empty($data['outlet_id'])) {
            $outlet = IspOutlet::where('public_id', $data['outlet_id'])
                ->where('business_id', $business->id)
                ->first();
            if ($outlet) {
                $outletId = $outlet->id;
            }
        }

        // Calculate total amount and resolve product IDs
        $totalAmount = 0;
        $resolvedItems = [];
        foreach ($data['items'] as $item) {
            $product = IspVoucherProduct::where('public_id', $item['voucher_product_id'])
                ->where('business_id', $business->id)
                ->first();

            if (!$product) {
                throw new \Exception("Voucher product not found");
            }

            $totalAmount += $item['qty'] * $item['unit_price'];
            $resolvedItems[] = [
                'voucher_product_id' => $product->id,
                'qty' => $item['qty'],
                'unit_price' => $item['unit_price'],
            ];
        }

        return DB::transaction(function () use ($business, $user, $data, $totalAmount, $outletId, $resolvedItems) {
            // Create request
            $stockRequest = $this->requestRepo->create([
                'tenant_id' => $business->tenant_id,
                'business_id' => $business->id,
                'requested_by_user_id' => $user->id,
                'outlet_id' => $outletId,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'requested_at' => now(),
                'request_note' => $data['request_note'] ?? null,
            ]);

            // Create items
            $this->itemRepo->createMany($stockRequest->id, $resolvedItems);

            return $this->requestRepo->findById($stockRequest->id);
        });
    }

    /**
     * Approve stock request (Admin role)
     */
    public function approveRequest(string $businessPublicId, int $requestId, Request $request, ?string $note = null)
    {
        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            throw new \Exception("Business not found");
        }

        $stockRequest = $this->requestRepo->findById($requestId);
        if (!$stockRequest) {
            throw new \Exception("Request not found");
        }

        if ($stockRequest->business_id !== $business->id) {
            throw new \Exception("Unauthorized");
        }

        if ($stockRequest->status !== 'pending') {
            throw new \Exception("Request already processed");
        }

        $user = $request->user();
        $stockRequest->approve($user, $note);

        return $this->requestRepo->findById($requestId);
    }

    /**
     * Reject stock request (Admin role)
     */
    public function rejectRequest(string $businessPublicId, int $requestId, Request $request, ?string $note = null)
    {
        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            throw new \Exception("Business not found");
        }

        $stockRequest = $this->requestRepo->findById($requestId);
        if (!$stockRequest) {
            throw new \Exception("Request not found");
        }

        if ($stockRequest->business_id !== $business->id) {
            throw new \Exception("Unauthorized");
        }

        if ($stockRequest->status !== 'pending') {
            throw new \Exception("Request already processed");
        }

        $user = $request->user();
        $stockRequest->reject($user, $note);

        return $this->requestRepo->findById($requestId);
    }

    /**
     * Get all requests for a business
     */
    public function getBusinessRequests(string $businessPublicId, Request $request, ?string $status = null)
    {
        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            throw new \Exception("Business not found");
        }

        return $this->requestRepo->findByBusiness($business->id, $status);
    }

    /**
     * Get request detail
     */
    public function getRequestDetail(string $businessPublicId, int $requestId, Request $request)
    {
        $business = $this->getBusiness($businessPublicId, $request);
        if (!$business) {
            throw new \Exception("Business not found");
        }

        $stockRequest = $this->requestRepo->findById($requestId);
        if (!$stockRequest || $stockRequest->business_id !== $business->id) {
            throw new \Exception("Request not found");
        }

        return $stockRequest;
    }
}

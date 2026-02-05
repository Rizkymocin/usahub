import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/lib/axios';

// TypeScript Interfaces
export interface VoucherProduct {
    public_id: string;
    name: string;
    duration_value: number;
    duration_unit: string;
    selling_price: number;
    owner_share: number;
    reseller_fee: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
}

export interface Outlet {
    id: number;
    name: string;
    address?: string;
}

export interface StockRequestItem {
    id: number;
    stock_request_id: number;
    voucher_product_id: number;
    qty: number;
    unit_price: number;
    subtotal: number;
    voucher_product: VoucherProduct;
}

export interface StockRequest {
    id: number;
    tenant_id: number;
    business_id: number;
    requested_by_user_id: number;
    outlet_id: number | null;
    total_amount: number;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    processed_at: string | null;
    processed_by_user_id: number | null;
    request_note: string | null;
    process_note: string | null;
    requested_by: User;
    processed_by: User | null;
    outlet: Outlet | null;
    items: StockRequestItem[];
}

export interface CreateStockRequestData {
    items: {
        voucher_product_id: number;
        qty: number;
        unit_price: number;
    }[];
    outlet_id?: number;
    request_note?: string;
}

export interface AllocationStock {
    voucher_product_id: number;
    voucher_product: {
        id: number;
        name: string;
        selling_price: number;
    };
    total_allocated: number;
    total_sold: number;
    qty_available: number;
}

export const useStockStore = defineStore('stock', () => {
    const requests = ref<StockRequest[]>([]);
    const currentRequest = ref<StockRequest | null>(null);
    const myStock = ref<AllocationStock[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Fetch all stock requests for a business
     */
    async function fetchRequests(businessPublicId: string, status?: string) {
        loading.value = true;
        error.value = null;
        try {
            const url = `/businesses/${businessPublicId}/stock-requests${status ? `?status=${status}` : ''}`;
            const response = await axios.get(url);

            if (response.data.success) {
                requests.value = response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch requests');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to fetch stock requests';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetch finance user's stock allocations
     */
    async function fetchMyStock(businessPublicId: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/businesses/${businessPublicId}/voucher-allocations/my-stock`);

            if (response.data.data) {
                myStock.value = response.data.data;
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch stock allocations');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to fetch stock allocations';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetch detailed request with items
     */
    async function fetchRequestDetail(businessPublicId: string, requestId: number) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/businesses/${businessPublicId}/stock-requests/${requestId}`);

            if (response.data.success) {
                currentRequest.value = response.data.data;
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch request detail');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to fetch request detail';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Create new stock request
     */
    async function createRequest(businessPublicId: string, data: CreateStockRequestData) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(`/businesses/${businessPublicId}/stock-requests`, data);

            if (response.data.success) {
                // Add new request to the list
                requests.value.unshift(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create request');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to create stock request';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Approve a stock request (Admin role)
     */
    async function approveRequest(businessPublicId: string, requestId: number, processNote?: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(
                `/businesses/${businessPublicId}/stock-requests/${requestId}/approve`,
                { process_note: processNote }
            );

            if (response.data.success) {
                // Update the request in the list
                const index = requests.value.findIndex(r => r.id === requestId);
                if (index !== -1) {
                    requests.value[index] = response.data.data;
                }
                // Update current request if it's the same
                if (currentRequest.value?.id === requestId) {
                    currentRequest.value = response.data.data;
                }
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to approve request');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to approve request';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Reject a stock request (Admin role)
     */
    async function rejectRequest(businessPublicId: string, requestId: number, processNote?: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(
                `/businesses/${businessPublicId}/stock-requests/${requestId}/reject`,
                { process_note: processNote }
            );

            if (response.data.success) {
                // Update the request in the list
                const index = requests.value.findIndex(r => r.id === requestId);
                if (index !== -1) {
                    requests.value[index] = response.data.data;
                }
                // Update current request if it's the same
                if (currentRequest.value?.id === requestId) {
                    currentRequest.value = response.data.data;
                }
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to reject request');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to reject request';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Clear error state
     */
    function clearError() {
        error.value = null;
    }

    /**
     * Clear current request
     */
    function clearCurrentRequest() {
        currentRequest.value = null;
    }

    return {
        // State
        requests,
        currentRequest,
        myStock,
        loading,
        error,

        // Actions
        fetchRequests,
        fetchMyStock,
        fetchRequestDetail,
        createRequest,
        approveRequest,
        rejectRequest,
        clearError,
        clearCurrentRequest,
    };
});

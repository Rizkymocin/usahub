import { create } from 'zustand'
import axios from '@/lib/axios'

export interface StockRequestItem {
    id: number
    stock_request_id: number
    voucher_product_id: number
    qty: number
    unit_price: number
    subtotal: number
    voucher_product: {
        id: number
        name: string
        public_id: string
    }
}

export interface StockRequest {
    id: number
    business_id: number
    requested_by_user_id: number
    outlet_id?: number
    total_amount: number
    status: 'pending' | 'approved' | 'rejected'
    requested_at: string
    processed_at?: string
    processed_by_user_id?: number
    request_note?: string
    process_note?: string
    requested_by: {
        id: number
        name: string
        email: string
    }
    processed_by?: {
        id: number
        name: string
        email: string
    }
    outlet?: {
        id: number
        name: string
        public_id: string
    }
    items: StockRequestItem[]
}

interface StockRequestStore {
    requests: StockRequest[]
    isLoading: boolean
    lastFetchedBusinessId: string | null
    fetchRequests: (businessPublicId: string, status?: string, forceRefresh?: boolean) => Promise<void>
    approveRequest: (businessPublicId: string, requestId: number, note?: string) => Promise<void>
    rejectRequest: (businessPublicId: string, requestId: number, note?: string) => Promise<void>
}

export const useStockRequestStore = create<StockRequestStore>((set, get) => ({
    requests: [],
    isLoading: false,
    lastFetchedBusinessId: null,

    fetchRequests: async (businessPublicId: string, status?: string, forceRefresh = false) => {
        // Cache check
        const { lastFetchedBusinessId, requests } = get()
        if (!forceRefresh && lastFetchedBusinessId === businessPublicId && requests.length > 0) {
            return
        }

        set({ isLoading: true })
        try {
            const params = status && status !== 'all' ? { status } : {}
            const response = await axios.get(`/businesses/${businessPublicId}/stock-requests`, { params })
            set({
                requests: response.data.data,
                lastFetchedBusinessId: businessPublicId
            })
        } catch (error) {
            console.error('Failed to fetch stock requests:', error)
            set({ requests: [] })
        } finally {
            set({ isLoading: false })
        }
    },

    approveRequest: async (businessPublicId: string, requestId: number, note) => {
        set({ isLoading: true })
        try {
            await axios.post(`/businesses/${businessPublicId}/stock-requests/${requestId}/approve`, { process_note: note })
            // Refresh list after approval (force refresh)
            await get().fetchRequests(businessPublicId, undefined, true)
        } catch (error) {
            console.error('Failed to approve request:', error)
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    rejectRequest: async (businessPublicId: string, requestId: number, note) => {
        set({ isLoading: true })
        try {
            await axios.post(`/businesses/${businessPublicId}/stock-requests/${requestId}/reject`, { process_note: note })
            // Refresh list after rejection (force refresh)
            await get().fetchRequests(businessPublicId, undefined, true)
        } catch (error) {
            console.error('Failed to reject request:', error)
            throw error
        } finally {
            set({ isLoading: false })
        }
    },
}))

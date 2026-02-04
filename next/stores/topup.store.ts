import { create } from 'zustand'
import axios from '@/lib/axios'

export interface TopupRequestItem {
    id: number
    topup_request_id: number
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

export interface TopupRequest {
    id: number
    business_id: number
    outlet_id: number
    requested_amount: number
    status: 'requested' | 'approved' | 'rejected'
    requested_at: string
    approved_at?: string
    rejected_at?: string
    rejection_note?: string
    outlet: {
        id: number
        name: string
        public_id: string
    }
    items: TopupRequestItem[]
}

interface TopupStore {
    requests: TopupRequest[]
    isLoading: boolean
    fetchRequests: (businessPublicId: string, status?: string) => Promise<void>
    approveRequest: (businessPublicId: string, requestId: number, data: { payment_method: string, reference_no?: string, note?: string }) => Promise<void>
    rejectRequest: (businessPublicId: string, requestId: number, note?: string) => Promise<void>
}

export const useTopupStore = create<TopupStore>((set, get) => ({
    requests: [],
    isLoading: false,

    fetchRequests: async (businessPublicId: string, status?: string) => {
        set({ isLoading: true })
        try {
            const params = status && status !== 'all' ? { status } : {}
            const response = await axios.get(`/businesses/${businessPublicId}/topup-requests`, { params })
            set({ requests: response.data.data })
        } catch (error) {
            console.error('Failed to fetch topup requests:', error)
            set({ requests: [] })
        } finally {
            set({ isLoading: false })
        }
    },

    approveRequest: async (businessPublicId: string, requestId: number, data) => {
        set({ isLoading: true })
        try {
            await axios.post(`/businesses/${businessPublicId}/topup-requests/${requestId}/approve`, data)
            // Refresh list after approval
            await get().fetchRequests(businessPublicId)
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
            await axios.post(`/businesses/${businessPublicId}/topup-requests/${requestId}/reject`, { note })
            // Refresh list after rejection
            await get().fetchRequests(businessPublicId)
        } catch (error) {
            console.error('Failed to reject request:', error)
            throw error
        } finally {
            set({ isLoading: false })
        }
    }
}))

import { create } from 'zustand'
import axios from '@/lib/axios'

export interface VoucherSaleItem {
    id: number
    voucher_product_id: number
    quantity: number
    unit_price: number
    subtotal: number
    voucher_product?: {
        id: number
        name: string
        price: number
        stock: number
    }
}

export interface VoucherSale {
    id: number
    public_id: string
    channel_type: 'outlet' | 'reseller' | 'admin'
    outlet_id?: number
    reseller_id?: number
    customer_name?: string
    customer_phone?: string
    total_amount: number
    payment_method: 'cash' | 'partial' | 'credit'
    paid_amount: number
    remaining_amount: number
    status: string
    sold_at: string
    is_prepaid: boolean
    delivered_at: string | null
    delivery_note: string | null
    items: VoucherSaleItem[]
    outlet?: {
        id: number
        name: string
    }
    reseller?: {
        id: number
        name: string
        code: string
    }
    sold_by?: {
        id: number
        name: string
    }
    payment_status?: 'paid' | 'partial' | 'unpaid'
}

interface VoucherSaleState {
    sales: VoucherSale[]
    pendingDeliveries: VoucherSale[]
    isLoading: boolean
    error: string | null

    fetchSales: (businessPublicId: string) => Promise<void>
    createSale: (businessPublicId: string, payload: any) => Promise<VoucherSale>
    addPayment: (businessPublicId: string, salePublicId: string, amount: number) => Promise<VoucherSale>
    fetchPendingDeliveries: (businessPublicId: string) => Promise<void>
    markAsDelivered: (businessPublicId: string, salePublicId: string, payload: { items: { voucher_product_id: number, delivered_qty: number }[], delivery_note?: string }) => Promise<VoucherSale>
    reset: () => void
}

export const useVoucherSaleStore = create<VoucherSaleState>((set, get) => ({
    sales: [],
    pendingDeliveries: [],
    isLoading: false,
    error: null,

    fetchSales: async (businessPublicId: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.get(`businesses/${businessPublicId}/voucher-sales`)
            if (response.data.success) {
                set({
                    sales: response.data.data,
                    isLoading: false
                })
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch voucher sales',
                isLoading: false
            })
        }
    },

    createSale: async (businessPublicId: string, payload: any) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(`businesses/${businessPublicId}/voucher-sales`, payload)
            if (response.data.success) {
                set((state) => ({
                    sales: [response.data.data, ...state.sales],
                    isLoading: false
                }))
                return response.data.data
            }
            throw new Error('Failed to create sale')
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create sale',
                isLoading: false
            })
            throw error
        }
    },

    addPayment: async (businessPublicId: string, salePublicId: string, amount: number) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(
                `businesses/${businessPublicId}/voucher-sales/${salePublicId}/payment`,
                { amount }
            )
            if (response.data.success) {
                set((state) => ({
                    sales: state.sales.map(sale =>
                        sale.public_id === salePublicId ? response.data.data : sale
                    ),
                    isLoading: false
                }))
                return response.data.data
            }
            throw new Error('Failed to add payment')
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to add payment',
                isLoading: false
            })
            throw error
        }
    },

    reset: () => {
        set({
            sales: [],
            pendingDeliveries: [],
            isLoading: false,
            error: null
        })
    },

    fetchPendingDeliveries: async (businessPublicId: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.get(`businesses/${businessPublicId}/voucher-sales/pending-delivery`)
            if (response.data.success) {
                set({
                    pendingDeliveries: response.data.data,
                    isLoading: false
                })
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch pending deliveries',
                isLoading: false
            })
        }
    },

    markAsDelivered: async (businessPublicId: string, salePublicId: string, payload: { items: { voucher_product_id: number, delivered_qty: number }[], delivery_note?: string }) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(
                `businesses/${businessPublicId}/voucher-sales/${salePublicId}/mark-delivered`,
                payload
            )
            if (response.data.success) {
                // Remove from pending deliveries and update in sales
                set((state) => ({
                    pendingDeliveries: state.pendingDeliveries.filter(s => s.public_id !== salePublicId),
                    sales: state.sales.map(sale =>
                        sale.public_id === salePublicId ? response.data.data : sale
                    ),
                    isLoading: false
                }))
                return response.data.data
            }
            throw new Error('Failed to mark as delivered')
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to mark as delivered',
                isLoading: false
            })
            throw error
        }
    },
}))

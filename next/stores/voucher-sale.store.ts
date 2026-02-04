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
    total_amount: number
    payment_method: 'cash' | 'partial' | 'credit'
    paid_amount: number
    remaining_amount: number
    status: string
    sold_at: string
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
    isLoading: boolean
    error: string | null

    fetchSales: (businessPublicId: string) => Promise<void>
    createSale: (businessPublicId: string, payload: any) => Promise<VoucherSale>
    addPayment: (businessPublicId: string, salePublicId: string, amount: number) => Promise<VoucherSale>
    reset: () => void
}

export const useVoucherSaleStore = create<VoucherSaleState>((set, get) => ({
    sales: [],
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
            isLoading: false,
            error: null
        })
    }
}))

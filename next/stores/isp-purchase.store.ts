import { create } from 'zustand'
import axios from '@/lib/axios'

export interface IspPurchaseItem {
    id: number
    isp_purchase_id: number
    item_name: string
    quantity: number
    unit: string
    unit_price: number
    subtotal: number
    isp_maintenance_item_id?: number
    maintenance_item?: {
        id: number
        name: string
        unit: string
    }
}

export interface IspPurchase {
    id: number
    public_id: string
    purchase_date: string
    type: 'maintenance' | 'general'
    total_amount: number
    supplier_name?: string
    invoice_number?: string
    notes?: string
    created_by_user_id: number
    items: IspPurchaseItem[]
    created_by?: {
        id: number
        name: string
    }
}

interface IspPurchaseState {
    purchases: IspPurchase[]
    isLoading: boolean
    error: string | null

    fetchPurchases: (businessPublicId: string) => Promise<void>
    createPurchase: (businessPublicId: string, payload: any) => Promise<IspPurchase>
}

export const useIspPurchaseStore = create<IspPurchaseState>((set) => ({
    purchases: [],
    isLoading: false,
    error: null,

    fetchPurchases: async (businessPublicId: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.get(`businesses/${businessPublicId}/purchases`)
            if (response.data.success) {
                set({
                    purchases: response.data.data,
                    isLoading: false
                })
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch purchases',
                isLoading: false
            })
        }
    },

    createPurchase: async (businessPublicId: string, payload: any) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(`businesses/${businessPublicId}/purchases`, payload)
            if (response.data.success) {
                set((state) => ({
                    purchases: [response.data.data, ...state.purchases],
                    isLoading: false
                }))
                return response.data.data
            }
            throw new Error('Failed to create purchase')
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create purchase',
                isLoading: false
            })
            throw error
        }
    }
}))

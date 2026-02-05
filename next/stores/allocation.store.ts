import { create } from 'zustand'
import axios from '@/lib/axios'

export interface AllocationUser {
    id: number
    name: string
}

export interface AllocationProduct {
    id: number
    name: string
}

export interface Allocation {
    id: number
    allocated_to: AllocationUser
    voucher_product: AllocationProduct
    qty_allocated: number
    qty_sold: number
    qty_available: number
    status: 'active' | 'closed'
    allocated_at: string
}

interface AllocationState {
    allocations: Allocation[]
    isLoading: boolean
    fetchAllocations: (businessId: string) => Promise<void>
}

export const useAllocationStore = create<AllocationState>((set) => ({
    allocations: [],
    isLoading: false,

    fetchAllocations: async (businessId: string) => {
        set({ isLoading: true })
        try {
            const response = await axios.get(`/businesses/${businessId}/voucher-allocations`)
            if (response.data?.data) {
                set({ allocations: response.data.data })
            }
        } catch (error) {
            console.error('Failed to fetch allocations:', error)
        } finally {
            set({ isLoading: false })
        }
    }
}))

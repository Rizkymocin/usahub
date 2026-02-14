import { create } from 'zustand'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

export interface TaskExpense {
    id: number
    public_id: string
    maintenance_issue_id: number
    user_id: number
    category: 'transport' | 'food_drink' | 'other'
    amount: number
    description: string | null
    receipt_photo: string | null
    created_at: string
    updated_at: string
    technician?: {
        id: number
        name: string
    }
    maintenance_issue?: {
        id: number
        public_id: string
        title: string
        type: string
    }
}

interface ExpenseFilters {
    technician_id?: number
    category?: string
    date_from?: string
    date_to?: string
}

interface ExpenseStore {
    expenses: TaskExpense[]
    loading: boolean
    error: string | null
    fetchExpenses: (businessPublicId: string, filters?: ExpenseFilters) => Promise<void>
    deleteExpense: (businessPublicId: string, expensePublicId: string) => Promise<void>
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
    expenses: [],
    loading: false,
    error: null,

    fetchExpenses: async (businessPublicId: string, filters?: ExpenseFilters) => {
        set({ loading: true, error: null })

        try {
            const token = localStorage.getItem('token')
            const params = new URLSearchParams()

            if (filters?.technician_id) params.append('technician_id', filters.technician_id.toString())
            if (filters?.category) params.append('category', filters.category)
            if (filters?.date_from) params.append('date_from', filters.date_from)
            if (filters?.date_to) params.append('date_to', filters.date_to)

            const response = await axios.get(
                `${API_BASE_URL}/businesses/${businessPublicId}/expenses?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            set({ expenses: response.data.expenses, loading: false })
        } catch (err: any) {
            set({
                error: err.response?.data?.message || 'Failed to fetch expenses',
                loading: false
            })
        }
    },

    deleteExpense: async (businessPublicId: string, expensePublicId: string) => {
        try {
            const token = localStorage.getItem('token')
            await axios.delete(
                `${API_BASE_URL}/businesses/${businessPublicId}/expenses/${expensePublicId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            // Remove from local state
            set(state => ({
                expenses: state.expenses.filter(e => e.public_id !== expensePublicId)
            }))
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to delete expense' })
            throw err
        }
    }
}))

import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth.store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

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
}

export interface ExpenseLimits {
    transport: number
    food_drink: number
    other: number
}

export const useExpenseStore = defineStore('expense', () => {
    const authStore = useAuthStore()

    const expenses = ref<TaskExpense[]>([])
    const totalExpenses = ref<number>(0)
    const limits = ref<ExpenseLimits>({
        transport: 200000,
        food_drink: 100000,
        other: 50000
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Fetch expenses for a specific maintenance issue
     */
    async function fetchExpenses(businessPublicId: string, issuePublicId: string) {
        loading.value = true
        error.value = null

        try {
            const token = authStore.token
            const response = await axios.get(
                `${API_BASE_URL}/businesses/${businessPublicId}/maintenance-issues/${issuePublicId}/expenses`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            expenses.value = response.data.expenses
            totalExpenses.value = response.data.total
            limits.value = response.data.limits
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch expenses'
            console.error('Fetch expenses error:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * Submit a new expense
     */
    async function submitExpense(
        businessPublicId: string,
        issuePublicId: string,
        data: {
            category: string
            amount: number
            description?: string
            receipt_photo?: File
        }
    ) {
        loading.value = true
        error.value = null

        try {
            const token = authStore.token
            const formData = new FormData()

            formData.append('category', data.category)
            formData.append('amount', data.amount.toString())
            if (data.description) {
                formData.append('description', data.description)
            }
            if (data.receipt_photo) {
                formData.append('receipt_photo', data.receipt_photo)
            }

            const response = await axios.post(
                `${API_BASE_URL}/businesses/${businessPublicId}/maintenance-issues/${issuePublicId}/expenses`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            // Add new expense to the list
            expenses.value.unshift(response.data.expense)
            totalExpenses.value += parseFloat(response.data.expense.amount)

            return response.data.expense
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to submit expense'
            console.error('Submit expense error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Delete an expense
     */
    async function deleteExpense(businessPublicId: string, expensePublicId: string) {
        loading.value = true
        error.value = null

        try {
            const token = authStore.token
            await axios.delete(
                `${API_BASE_URL}/businesses/${businessPublicId}/expenses/${expensePublicId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            // Remove from local state
            const deletedExpense = expenses.value.find(e => e.public_id === expensePublicId)
            if (deletedExpense) {
                totalExpenses.value -= parseFloat(deletedExpense.amount.toString())
                expenses.value = expenses.value.filter(e => e.public_id !== expensePublicId)
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete expense'
            console.error('Delete expense error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Get category label in Indonesian
     */
    function getCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            transport: 'Transport',
            food_drink: 'Makan & Minum',
            other: 'Lainnya'
        }
        return labels[category] || category
    }

    /**
     * Get category limit
     */
    function getCategoryLimit(category: string): number {
        return limits.value[category as keyof ExpenseLimits] || 0
    }

    /**
     * Format currency
     */
    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return {
        expenses,
        totalExpenses,
        limits,
        loading,
        error,
        fetchExpenses,
        submitExpense,
        deleteExpense,
        getCategoryLabel,
        getCategoryLimit,
        formatCurrency
    }
})

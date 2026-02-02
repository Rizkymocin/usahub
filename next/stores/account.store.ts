import { create } from 'zustand'
import axios from '@/lib/axios'

interface Account {
    id: number
    public_id: string
    name: string
    code: string
    type: string
    parent_id: number | null
}

interface AccountState {
    accounts: Account[]
    currentBusinessId: string | null
    isLoading: boolean
    error: string | null

    fetchAccounts: (businessPublicId: string) => Promise<void>
    addAccount: (account: Account) => void
    removeAccount: (id: number) => void
    reset: () => void
}

export const useAccountStore = create<AccountState>((set, get) => ({
    accounts: [],
    currentBusinessId: null,
    isLoading: false,
    error: null,

    fetchAccounts: async (businessPublicId: string) => {
        const { currentBusinessId, accounts } = get()
        // If data exists for the same business, don't refetch
        if (currentBusinessId === businessPublicId && accounts.length > 0) {
            return
        }

        set({ isLoading: true, error: null })
        try {
            const response = await axios.get(`businesses/${businessPublicId}/accounts`)
            if (response.data.success) {
                set({
                    accounts: response.data.data,
                    currentBusinessId: businessPublicId,
                    isLoading: false
                })
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch accounts',
                isLoading: false
            })
        }
    },

    addAccount: (account: Account) => {
        set((state) => ({
            accounts: [...state.accounts, account]
        }))
    },

    removeAccount: (id: number) => {
        set((state) => ({
            accounts: state.accounts.filter(acc => acc.id !== id)
        }))
    },

    reset: () => {
        set({
            accounts: [],
            currentBusinessId: null,
            isLoading: false,
            error: null
        })
    }
}))

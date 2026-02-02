import { create } from 'zustand'
import axios from '@/lib/axios'

export interface User {
    id: number
    name: string
    email: string
    role: string
}

interface BusinessUserState {
    users: User[]
    currentBusinessId: string | null
    isLoading: boolean
    error: string | null

    fetchUsers: (businessPublicId: string) => Promise<void>
    addUser: (user: User) => void
    removeUser: (id: number) => void
    reset: () => void
}

export const useBusinessUserStore = create<BusinessUserState>((set, get) => ({
    users: [],
    currentBusinessId: null,
    isLoading: false,
    error: null,

    fetchUsers: async (businessPublicId: string) => {
        const { currentBusinessId, users } = get()
        // If data exists for the same business, don't refetch
        if (currentBusinessId === businessPublicId && users.length > 0) {
            return
        }

        set({ isLoading: true, error: null })
        try {
            const response = await axios.get(`businesses/${businessPublicId}/users`)
            if (response.data.success) {
                set({
                    users: response.data.data,
                    currentBusinessId: businessPublicId,
                    isLoading: false
                })
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch users',
                isLoading: false
            })
        }
    },

    addUser: (user: User) => {
        set((state) => ({
            users: [...state.users, user]
        }))
    },

    removeUser: (id: number) => {
        set((state) => ({
            users: state.users.filter(u => u.id !== id)
        }))
    },

    reset: () => {
        set({
            users: [],
            currentBusinessId: null,
            isLoading: false,
            error: null
        })
    }
}))

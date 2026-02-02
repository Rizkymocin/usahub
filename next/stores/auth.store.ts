import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthState, User } from '@/types/auth'

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            login: (token, user) => set({ token, user }),
            logout: () => {
                set({ token: null, user: null })
                localStorage.removeItem('auth-storage')
            },

            setUser: (user: User) => {
                set({ user })
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            })
        }
    )
)
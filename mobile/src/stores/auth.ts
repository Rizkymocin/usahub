import { defineStore } from 'pinia';
import axios from 'axios';
import { f7 } from 'framework7-vue';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
        isLoading: false,
        error: null as string | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(email: string, password: string) {
            this.isLoading = true;
            this.error = null;
            try {
                // Replace with actual API endpoint
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
                    email,
                    password
                });

                if (response.data.success) {
                    const { token, user } = response.data.data;
                    this.token = token;
                    this.user = user;

                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    // Navigate to home
                    f7.views.main.router.navigate('/');
                }
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Login failed';
            } finally {
                this.isLoading = false;
            }
        },

        logout() {
            this.token = '';
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            f7.views.main.router.navigate('/login');
        }
    }
});

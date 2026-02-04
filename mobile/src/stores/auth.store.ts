import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '@/lib/axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'));
    const user = ref<any>(null); // Type user later
    const isAuthenticated = computed(() => !!token.value);

    async function login(email: string, pass: string) {
        try {
            const res = await axios.post('/mobile/login', { user: email, password: pass });
            if (res.data.success && res.data.data.token) {
                token.value = res.data.data.token;
                user.value = res.data.data.user;
                localStorage.setItem('token', token.value!);
                localStorage.setItem('user', JSON.stringify(user.value));
            } else {
                throw new Error(res.data.message || 'Login failed');
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Gagal terhubung ke server');
        }
    }

    function checkAuth() {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            token.value = storedToken;
            user.value = JSON.parse(storedUser);

            // Verify token validity in background
            axios.get('/mobile/user').catch(() => logout());
        }
    }

    function logout() {
        if (token.value) {
            axios.post('/mobile/logout').catch(err => console.error("Logout api failed", err));
        }
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    // Initialize
    checkAuth();

    return { token, user, isAuthenticated, login, logout, checkAuth };
});

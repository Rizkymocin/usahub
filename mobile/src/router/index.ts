import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import LoginView from '@/views/LoginView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'
import ActivityView from '@/views/ActivityView.vue'
import AccountView from '@/views/AccountView.vue'
import VoucherView from '@/views/VoucherView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { requiresAuth: false }
        },
        {
            path: '/',
            component: MainLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'home',
                    component: HomeView
                },
                {
                    path: 'activity',
                    name: 'activity',
                    component: ActivityView
                },
                {
                    path: 'account',
                    name: 'account',
                    component: AccountView
                },
                {
                    path: 'voucher',
                    name: 'voucher',
                    component: VoucherView
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next({ name: 'login' })
    } else if (to.name === 'login' && auth.isAuthenticated) {
        next({ name: 'home' })
    } else {
        next()
    }
})

export default router

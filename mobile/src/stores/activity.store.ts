import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/lib/axios';

export interface ActivityLog {
    id: number;
    description: string;
    created_at: string;
    causer?: {
        name: string;
    };
    properties?: any;
    subject_type?: string;
}

export const useActivityStore = defineStore('activity', () => {
    const logs = ref<ActivityLog[]>([]);
    const recentLogs = ref<ActivityLog[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchLogs(businessId: string, limit: number = 20) {
        loading.value = true;
        try {
            // Get current user ID from local storage or store
            // We can assume auth store has accessible user, but cleaner to rely on passed args or store access
            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;

            const { data } = await axios.get(`/businesses/${businessId}/activity-logs`, {
                params: {
                    per_page: limit,
                    user_id: userId,
                    exclude_events: 'login,logout'
                }
            });
            logs.value = data.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat aktivitas';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    async function fetchRecentLogs(businessId: string) {
        try {
            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;

            const { data } = await axios.get(`/businesses/${businessId}/activity-logs`, {
                params: {
                    per_page: 5,
                    user_id: userId,
                    exclude_events: 'login,logout'
                }
            });
            recentLogs.value = data.data;
        } catch (err) {
            console.error('Failed to fetch recent logs', err);
        }
    }

    return { logs, recentLogs, loading, error, fetchLogs, fetchRecentLogs };
});

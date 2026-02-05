import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/lib/axios';

export interface Outlet {
    id: number;
    public_id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    status: boolean;
}

export const useOutletStore = defineStore('outlet', () => {
    const outlets = ref<Outlet[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchOutlets(businessPublicId: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/businesses/${businessPublicId}/outlets`);
            if (response.data.success) {
                outlets.value = response.data.data;
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch outlets');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to fetch outlets';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        outlets,
        loading,
        error,
        fetchOutlets
    };
});

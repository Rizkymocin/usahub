import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/lib/axios';

export interface Reseller {
    id: number;
    reseller_code: string;
    name: string;
    phone: string;
    address: string | null;
    is_active: boolean;
    outlet_id: number | null;
}

export const useResellerStore = defineStore('reseller', () => {
    const resellers = ref<Reseller[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchResellers(businessPublicId: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/businesses/${businessPublicId}/resellers`);
            if (response.data.success) {
                resellers.value = response.data.data;
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch resellers');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to fetch resellers';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        resellers,
        loading,
        error,
        fetchResellers
    };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/lib/axios';


export interface Reseller {
    id: number;
    code: string;
    name: string;
    phone: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    created_at: string;
    business_id: number;
    outlet_id: number;
}

export const useResellerStore = defineStore('reseller', () => {
    const resellers = ref<Reseller[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // const authStore = useAuthStore();

    const fetchResellers = async (businessPublicId: string) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/businesses/${businessPublicId}/resellers`);
            resellers.value = response.data.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat data reseller';
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchInactiveResellers = async (businessPublicId: string) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/businesses/${businessPublicId}/resellers/inactive`);
            resellers.value = response.data.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat data reseller baru';
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const createReseller = async (businessPublicId: string, data: any) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(`/businesses/${businessPublicId}/prospects`, data);
            // Don't push to resellers list - prospects go through approval flow
            return response.data.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal mendaftarkan reseller';
            console.error(err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        resellers,
        loading,
        error,
        fetchResellers,
        fetchInactiveResellers,
        createReseller
    };
});

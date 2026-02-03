import { create } from 'zustand';
import axios from '@/lib/axios';

export interface Reseller {
    id?: number; // Backend hides it
    name: string;
    code: string;
    phone: string;
    address?: string;
    outlet?: {
        name: string;
        public_id?: string;
    };
    is_active: boolean;
    public_id?: string;
    created_at?: string;
    updated_at?: string;
}

interface ResellerState {
    resellers: Reseller[];
    currentBusinessId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchResellers: (businessId: string) => Promise<void>;
    addReseller: (businessId: string, data: { outlet_public_id: string; name: string; phone: string; address: string }) => Promise<void>;
    updateReseller: (businessId: string, resellerCode: string, data: any) => Promise<void>;
    deleteReseller: (businessId: string, resellerCode: string) => Promise<void>;
}

export const useResellerStore = create<ResellerState>((set, get) => ({
    resellers: [],
    currentBusinessId: null,
    isLoading: false,
    error: null,

    fetchResellers: async (businessId: string) => {
        const { currentBusinessId, resellers } = get();

        // If we already have resellers for this business, don't refetch
        if (currentBusinessId === businessId && resellers.length > 0) {
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/resellers`);
            set({
                resellers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal memuat reseller',
                isLoading: false
            });
        }
    },

    addReseller: async (businessId: string, data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/resellers`, data);

            // Refetch to ensure fresh data
            const res = await axios.get(`businesses/${businessId}/resellers`);
            set({
                resellers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });

        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menambahkan reseller',
                isLoading: false
            });
            throw error;
        }
    },

    updateReseller: async (businessId: string, resellerCode: string, data: any) => {
        set({ isLoading: true, error: null });
        try {
            await axios.put(`businesses/${businessId}/resellers/${resellerCode}`, data);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/resellers`);
            set({
                resellers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate reseller',
                isLoading: false
            });
            throw error;
        }
    },

    deleteReseller: async (businessId: string, resellerCode: string) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`businesses/${businessId}/resellers/${resellerCode}`);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/resellers`);
            set({
                resellers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menghapus reseller',
                isLoading: false
            });
            throw error;
        }
    }
}));

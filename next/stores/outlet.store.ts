import { create } from 'zustand';
import axios from '@/lib/axios';

export interface Outlet {
    id?: number; // Kept optional just in case, but backend hides it
    public_id: string;
    business_id?: number;
    name: string;
    phone: string;
    address: string;
    current_balance: number;
    status: number | boolean;
    created_at: string;
    updated_at: string;
}

interface OutletState {
    outlets: Outlet[];
    currentBusinessId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchOutlets: (businessId: string) => Promise<void>;
    addOutlet: (businessId: string, data: { name: string; email: string; phone: string; address: string; role: string }) => Promise<void>;
    updateOutlet: (businessId: string, outletPublicId: string, data: any) => Promise<void>;
    deleteOutlet: (businessId: string, outletPublicId: string) => Promise<void>;
}

export const useOutletStore = create<OutletState>((set, get) => ({
    outlets: [],
    currentBusinessId: null,
    isLoading: false,
    error: null,

    fetchOutlets: async (businessId: string) => {
        const { currentBusinessId, outlets } = get();

        // If we already have outlets for this business, don't refetch
        if (currentBusinessId === businessId && outlets.length > 0) {
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/outlets`);
            set({
                outlets: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal memuat outlet',
                isLoading: false
            });
        }
    },

    addOutlet: async (businessId: string, data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/outlets`, data);

            const res = await axios.get(`businesses/${businessId}/outlets`);
            set({
                outlets: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });

        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menambahkan outlet',
                isLoading: false
            });
            throw error;
        }
    },

    updateOutlet: async (businessId: string, outletPublicId: string, data: any) => {
        // Optimistic update? Or loading state? Let's use loading for safety first.
        set({ isLoading: true, error: null });
        try {
            await axios.put(`businesses/${businessId}/outlets/${outletPublicId}`, data);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/outlets`);
            set({
                outlets: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate outlet',
                isLoading: false
            });
            throw error;
        }
    },

    deleteOutlet: async (businessId: string, outletPublicId: string) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`businesses/${businessId}/outlets/${outletPublicId}`);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/outlets`);
            set({
                outlets: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menghapus outlet',
                isLoading: false
            });
            throw error;
        }
    }
}));

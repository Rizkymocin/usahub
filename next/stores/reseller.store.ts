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
    ip_address?: string;
    cidr?: number;
    public_id?: string;
    latitude?: number;
    longitude?: number;
    uplink_reseller_id?: number | null;
    created_at?: string;
    updated_at?: string;
}

interface ResellerState {
    resellers: Reseller[];
    activeResellers: Reseller[];
    inactiveResellers: Reseller[];
    currentBusinessId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchResellers: (businessId: string) => Promise<void>;
    fetchActiveResellers: (businessId: string) => Promise<void>;
    fetchInactiveResellers: (businessId: string) => Promise<void>;
    addReseller: (businessId: string, data: { outlet_public_id: string; name: string; phone: string; address: string; ip_address?: string; cidr?: number; latitude?: number; longitude?: number }) => Promise<void>;
    updateReseller: (businessId: string, resellerCode: string, data: any) => Promise<void>;
    deleteReseller: (businessId: string, resellerCode: string) => Promise<void>;
    activateReseller: (businessId: string, resellerCode: string) => Promise<void>;
}

export const useResellerStore = create<ResellerState>((set, get) => ({
    resellers: [],
    activeResellers: [],
    inactiveResellers: [],
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

    fetchActiveResellers: async (businessId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/resellers/active`);
            console.log('Active Resellers Response:', res.data);
            set({
                activeResellers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Error fetching active resellers:', error);
            set({
                error: error.response?.data?.message || 'Gagal memuat reseller aktif',
                isLoading: false
            });
        }
    },

    fetchInactiveResellers: async (businessId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/resellers/inactive`);
            console.log('Inactive Resellers Response:', res.data);
            set({
                inactiveResellers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Error fetching inactive resellers:', error);
            set({
                error: error.response?.data?.message || 'Gagal memuat reseller baru',
                isLoading: false
            });
        }
    },

    addReseller: async (businessId: string, data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/resellers`, data);

            // Refetch inactive resellers since new ones are inactive by default
            const res = await axios.get(`businesses/${businessId}/resellers/inactive`);
            set({
                inactiveResellers: res.data.data,
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

            // Refetch both lists
            const [activeRes, inactiveRes] = await Promise.all([
                axios.get(`businesses/${businessId}/resellers/active`),
                axios.get(`businesses/${businessId}/resellers/inactive`)
            ]);

            set({
                activeResellers: activeRes.data.data,
                inactiveResellers: inactiveRes.data.data,
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

            // Refetch both lists
            const [activeRes, inactiveRes] = await Promise.all([
                axios.get(`businesses/${businessId}/resellers/active`),
                axios.get(`businesses/${businessId}/resellers/inactive`)
            ]);

            set({
                activeResellers: activeRes.data.data,
                inactiveResellers: inactiveRes.data.data,
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
    },

    activateReseller: async (businessId: string, resellerCode: string) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/resellers/${resellerCode}/activate`);

            // Refetch both lists
            const [activeRes, inactiveRes] = await Promise.all([
                axios.get(`businesses/${businessId}/resellers/active`),
                axios.get(`businesses/${businessId}/resellers/inactive`)
            ]);

            set({
                activeResellers: activeRes.data.data,
                inactiveResellers: inactiveRes.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengaktifkan reseller',
                isLoading: false
            });
            throw error;
        }
    }
}));

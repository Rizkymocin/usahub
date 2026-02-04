import { create } from 'zustand';
import axios from '@/lib/axios';

export interface VoucherProduct {
    id?: number;
    public_id?: string;
    business_id?: number;
    name: string;
    description?: string;
    duration_value: number;
    duration_unit: 'hour' | 'day' | 'month';
    selling_price: number;
    owner_share: number;
    reseller_fee: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface VoucherState {
    vouchers: VoucherProduct[];
    currentBusinessId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchVouchers: (businessId: string) => Promise<void>;
    addVoucher: (businessId: string, data: Partial<VoucherProduct>) => Promise<void>;
    updateVoucher: (businessId: string, voucherId: string, data: Partial<VoucherProduct>) => Promise<void>;
    deleteVoucher: (businessId: string, voucherId: string) => Promise<void>;
}

export const useVoucherStore = create<VoucherState>((set, get) => ({
    vouchers: [],
    currentBusinessId: null,
    isLoading: false,
    error: null,

    fetchVouchers: async (businessId: string) => {
        const { currentBusinessId, vouchers } = get();

        // If we already have vouchers for this business, don't refetch
        if (currentBusinessId === businessId && vouchers.length > 0) {
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/vouchers`);
            set({
                vouchers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal memuat voucher',
                isLoading: false
            });
        }
    },

    addVoucher: async (businessId: string, data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/vouchers`, data);

            // Refetch to ensure fresh data
            const res = await axios.get(`businesses/${businessId}/vouchers`);
            set({
                vouchers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });

        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menambahkan voucher',
                isLoading: false
            });
            throw error;
        }
    },

    updateVoucher: async (businessId: string, voucherId: string, data: Partial<VoucherProduct>) => {
        set({ isLoading: true, error: null });
        try {
            await axios.put(`businesses/${businessId}/vouchers/${voucherId}`, data);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/vouchers`);
            set({
                vouchers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate voucher',
                isLoading: false
            });
            throw error;
        }
    },

    deleteVoucher: async (businessId: string, voucherId: string) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`businesses/${businessId}/vouchers/${voucherId}`);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/vouchers`);
            set({
                vouchers: res.data.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menghapus voucher',
                isLoading: false
            });
            throw error;
        }
    },
}));

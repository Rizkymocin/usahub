import { create } from 'zustand';
import axios from '@/lib/axios';
import { VoucherProduct } from './voucher.store';
import { User } from '@/types/auth';

export interface IspVoucherStock {
    id: number;
    tenant_id: number;
    business_id: number;
    voucher_product_id: number;
    quantity: number;
    purchase_price: number | null;
    default_selling_price: number;
    notes: string | null;
    created_by_user_id: number | null;
    created_at: string;
    updated_at: string;
    voucher_product?: VoucherProduct;
    created_by?: User;
}

export interface IspVoucherStockAdjustment {
    id: number;
    business_id: number;
    voucher_stock_id: number | null;
    voucher_allocation_id: number | null;
    voucher_product_id: number;
    quantity: number;
    adjustment_type: 'damage' | 'loss' | 'expired' | 'other';
    notes: string | null;
    created_by_user_id: number;
    created_at: string;
    voucher_product?: VoucherProduct;
    created_by?: User;
}

export interface StockSummary {
    voucher_product_id: number;
    total_quantity: number;
    total_value: number;
    voucher_product?: VoucherProduct;
}

interface AddStockData {
    voucher_product_id: number;
    quantity: number;
    purchase_price?: number;
    default_selling_price: number;
    notes?: string;
}

interface VoucherStockState {
    stocks: IspVoucherStock[];
    summary: StockSummary[];
    adjustments: IspVoucherStockAdjustment[];
    isLoading: boolean;
    error: string | null;

    fetchStocks: (businessId: string) => Promise<void>;
    fetchSummary: (businessId: string) => Promise<void>;
    fetchAdjustments: (businessId: string) => Promise<void>;
    addStock: (businessId: string, data: AddStockData) => Promise<void>;
    updatePrice: (businessId: string, stockId: number, price: number) => Promise<void>;
    deleteStock: (businessId: string, stockId: number) => Promise<void>;
    reportDamage: (businessId: string, stockId: number, quantity: number, reason: string, notes?: string, files?: File[]) => Promise<void>;
}

export const useVoucherStockStore = create<VoucherStockState>((set) => ({
    stocks: [],
    summary: [],
    adjustments: [],
    isLoading: false,
    error: null,

    fetchStocks: async (businessId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/voucher-stocks`);
            set({
                stocks: res.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal memuat stok voucher',
                isLoading: false
            });
        }
    },

    fetchSummary: async (businessId: string) => {
        try {
            const res = await axios.get(`businesses/${businessId}/voucher-stocks/summary`);
            set({ summary: res.data.data });
        } catch (error: any) {
            console.error('Failed to fetch stock summary:', error);
        }
    },

    fetchAdjustments: async (businessId: string) => {
        try {
            const res = await axios.get(`businesses/${businessId}/voucher-stock-adjustments`);
            set({ adjustments: res.data.data });
        } catch (error: any) {
            console.error('Failed to fetch adjustments:', error);
        }
    },

    addStock: async (businessId: string, data: AddStockData) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/voucher-stocks`, data);

            // Refetch stocks and summary
            const [stocksRes, summaryRes] = await Promise.all([
                axios.get(`businesses/${businessId}/voucher-stocks`),
                axios.get(`businesses/${businessId}/voucher-stocks/summary`)
            ]);

            set({
                stocks: stocksRes.data.data,
                summary: summaryRes.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menambahkan stok',
                isLoading: false
            });
            throw error;
        }
    },

    updatePrice: async (businessId: string, stockId: number, price: number) => {
        set({ isLoading: true, error: null });
        try {
            await axios.put(`businesses/${businessId}/voucher-stocks/${stockId}`, {
                default_selling_price: price
            });

            // Refetch stocks
            const res = await axios.get(`businesses/${businessId}/voucher-stocks`);
            set({
                stocks: res.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate harga',
                isLoading: false
            });
            throw error;
        }
    },

    deleteStock: async (businessId: string, stockId: number) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`businesses/${businessId}/voucher-stocks/${stockId}`);

            // Refetch stocks and summary
            const [stocksRes, summaryRes] = await Promise.all([
                axios.get(`businesses/${businessId}/voucher-stocks`),
                axios.get(`businesses/${businessId}/voucher-stocks/summary`)
            ]);

            set({
                stocks: stocksRes.data.data,
                summary: summaryRes.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menghapus stok',
                isLoading: false
            });
            throw error;
        }
    },

    reportDamage: async (businessId: string, stockId: number, quantity: number, reason: string, notes?: string, files?: File[]) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('quantity', quantity.toString());
            formData.append('reason', reason);
            if (notes) formData.append('notes', notes);
            if (files && files.length > 0) {
                files.forEach((file, index) => {
                    formData.append(`files[${index}]`, file);
                });
            }

            await axios.post(`businesses/${businessId}/voucher-stocks/${stockId}/adjustments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refetch stocks and summary
            const [stocksRes, summaryRes] = await Promise.all([
                axios.get(`businesses/${businessId}/voucher-stocks`),
                axios.get(`businesses/${businessId}/voucher-stocks/summary`)
            ]);

            set({
                stocks: stocksRes.data.data,
                summary: summaryRes.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal melaporkan kerusakan',
                isLoading: false
            });
            throw error;
        }
    }
}));

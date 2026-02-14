import { create } from 'zustand';
import axios from '@/lib/axios';

export interface IspMaintenanceIssue {
    id: number;
    public_id: string;
    business_id: number;
    reseller_id: number;
    outlet_id: number | null;
    reporter_id: number;
    title: string;
    description: string | null;
    type: 'infra' | 'cpe' | 'installation' | 'other';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    assigned_technician_id: number | null;
    reported_at: string;
    resolved_at: string | null;
    reseller?: {
        id: number;
        name: string;
        address: string;
    };
    assigned_technician?: {
        id: number;
        name: string;
    };
    reporter?: {
        id: number;
        name: string;
    };
    logs?: MaintenanceLog[];
}

export interface MaintenanceLog {
    id: number;
    action_taken: string;
    result: 'success' | 'pending' | 'failed';
    notes?: string;
    photos?: string[]; // URLs or paths
    created_at: string;
    technician: {
        id: number;
        name: string;
    };
    items?: MaintenanceLogItem[];
}

export interface MaintenanceLogItem {
    id: number;
    name: string;
    unit: string;
    stock: number;
    price: number;
    pivot: {
        log_id: number;
        item_id: number;
        quantity: number;
        notes?: string;
    };
}

interface CreateIssueData {
    title: string;
    reseller_id: number;
    priority: string;
    description: string;
}

interface UpdateIssueData {
    status?: string;
    assigned_technician_id?: number;
}

interface MaintenanceState {
    issues: IspMaintenanceIssue[];
    items: any[];
    isLoading: boolean;
    error: string | null;

    fetchIssues: (businessId: string) => Promise<void>;
    createIssue: (businessId: string, data: CreateIssueData) => Promise<void>;
    updateIssue: (businessId: string, issuePublicId: string, data: UpdateIssueData) => Promise<void>;

    fetchItems: (businessId: string) => Promise<void>;
    createItem: (businessId: string, data: any) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
    issues: [],
    isLoading: false,
    error: null,

    fetchIssues: async (businessId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/maintenance-issues`);
            set({
                issues: res.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal memuat data gangguan',
                isLoading: false
            });
        }
    },

    createIssue: async (businessId: string, data: CreateIssueData) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/maintenance-issues`, data);

            // Refetch to get updated list
            const res = await axios.get(`businesses/${businessId}/maintenance-issues`);
            set({
                issues: res.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal membuat laporan gangguan',
                isLoading: false
            });
            throw error;
        }
    },

    updateIssue: async (businessId: string, issuePublicId: string, data: UpdateIssueData) => {
        set({ isLoading: true, error: null });
        try {
            await axios.put(`businesses/${businessId}/maintenance-issues/${issuePublicId}`, data);

            // Refetch to get updated list
            const res = await axios.get(`businesses/${businessId}/maintenance-issues`);
            set({
                issues: res.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate gangguan',
                isLoading: false
            });
            throw error;
        }
    },

    // Inventory Actions
    items: [],
    fetchItems: async (businessId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/maintenance-items`);
            set({ items: res.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Gagal memuat alat & bahan', isLoading: false });
        }
    },

    createItem: async (businessId: string, data: any) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/maintenance-items`, data);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/maintenance-items`);
            set({ items: res.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Gagal menyimpan alat/bahan', isLoading: false });
            throw error;
        }
    }
}));


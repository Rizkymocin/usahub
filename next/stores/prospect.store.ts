import { create } from 'zustand';
import axios from '@/lib/axios';

export interface ReadinessConfirmation {
    id: number;
    prospect_id: number;
    user_id: number;
    confirmed_at: string;
    user?: { id: number; name: string };
}

export interface Prospect {
    id: number;
    public_id: string;
    business_id: number;
    outlet_id?: number;
    sales_id: number;
    name: string;
    phone: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    status: 'waiting' | 'approved' | 'rejected' | 'installed' | 'installation_rejected' | 'activated';
    admin_note?: string;
    technician_note?: string;
    approved_by?: number;
    approved_at?: string;
    installed_at?: string;
    activated_at?: string;
    maintenance_issue_id?: number;
    assigned_technician_id?: number;
    assigned_technician?: { id: number; name: string; email?: string };
    readiness_confirmations?: ReadinessConfirmation[];
    created_at: string;
    updated_at: string;
    sales?: { id: number; name: string; email?: string };
    approved_by_user?: { id: number; name: string };
    outlet?: { id: number; name: string; public_id: string };
    maintenance_issue?: { id: number; public_id: string; status: string; title: string };
}

interface ProspectState {
    prospects: Prospect[];
    currentBusinessId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchProspects: (businessId: string, status?: string) => Promise<void>;
    approveProspect: (businessId: string, publicId: string, note?: string, commissionAmount?: number, uplinkResellerId?: number) => Promise<void>;
    rejectProspect: (businessId: string, publicId: string, note: string) => Promise<void>;
    reApproveProspect: (businessId: string, publicId: string, note?: string) => Promise<void>;
    activateProspect: (businessId: string, publicId: string) => Promise<void>;
    assignTechnician: (businessId: string, publicId: string, technicianUserId: number) => Promise<void>;
}

export const useProspectStore = create<ProspectState>((set, get) => ({
    prospects: [],
    currentBusinessId: null,
    isLoading: false,
    error: null,

    fetchProspects: async (businessId: string, status?: string) => {
        set({ isLoading: true, error: null });
        try {
            const params = status ? `?status=${status}` : '';
            const res = await axios.get(`businesses/${businessId}/prospects${params}`);
            set({
                prospects: res.data.data,
                currentBusinessId: businessId,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal memuat data calon pelanggan',
                isLoading: false,
            });
        }
    },

    approveProspect: async (businessId: string, publicId: string, note?: string, commissionAmount?: number, uplinkResellerId?: number) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/prospects/${publicId}/approve`, { note, commission_amount: commissionAmount, uplink_reseller_id: uplinkResellerId });
            // Refetch
            await get().fetchProspects(businessId);
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menyetujui',
                isLoading: false,
            });
            throw error;
        }
    },

    rejectProspect: async (businessId: string, publicId: string, note: string) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/prospects/${publicId}/reject`, { note });
            await get().fetchProspects(businessId);
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menolak',
                isLoading: false,
            });
            throw error;
        }
    },

    reApproveProspect: async (businessId: string, publicId: string, note?: string) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/prospects/${publicId}/re-approve`, { note });
            await get().fetchProspects(businessId);
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menyetujui ulang',
                isLoading: false,
            });
            throw error;
        }
    },

    activateProspect: async (businessId: string, publicId: string) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/prospects/${publicId}/activate`);
            await get().fetchProspects(businessId);
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengaktifkan',
                isLoading: false,
            });
            throw error;
        }
    },

    assignTechnician: async (businessId: string, publicId: string, technicianUserId: number) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/prospects/${publicId}/assign-technician`, {
                technician_user_id: technicianUserId,
            });
            await get().fetchProspects(businessId);
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menugaskan teknisi',
                isLoading: false,
            });
            throw error;
        }
    },
}));

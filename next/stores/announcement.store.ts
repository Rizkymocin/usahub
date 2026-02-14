import { create } from 'zustand';
import axios from '@/lib/axios';

export interface Announcement {
    id: number;
    public_id: string;
    business_id?: number;
    title: string;
    content: string;
    type: 'info' | 'penting';
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

interface AnnouncementState {
    announcements: Announcement[];
    currentBusinessId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchAnnouncements: (businessId: string) => Promise<void>;
    addAnnouncement: (businessId: string, data: Partial<Announcement>) => Promise<void>;
    updateAnnouncement: (businessId: string, id: number, data: Partial<Announcement>) => Promise<void>;
    deleteAnnouncement: (businessId: string, id: number) => Promise<void>;
}

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
    announcements: [],
    currentBusinessId: null,
    isLoading: false,
    error: null,

    fetchAnnouncements: async (businessId: string) => {
        const { currentBusinessId, announcements } = get();

        // If we already have announcements for this business, don't refetch
        // unless we want to force refresh. For now, simple caching.
        if (currentBusinessId === businessId && announcements.length > 0) {
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`businesses/${businessId}/announcements`);
            set({
                announcements: res.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal memuat pengumuman',
                isLoading: false
            });
        }
    },

    addAnnouncement: async (businessId: string, data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`businesses/${businessId}/announcements`, data);

            // Refetch to get updated list
            const res = await axios.get(`businesses/${businessId}/announcements`);
            set({
                announcements: res.data,
                currentBusinessId: businessId,
                isLoading: false
            });

        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menambahkan pengumuman',
                isLoading: false
            });
            throw error;
        }
    },

    updateAnnouncement: async (businessId: string, id: number, data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.put(`businesses/${businessId}/announcements/${id}`, data);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/announcements`);
            set({
                announcements: res.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate pengumuman',
                isLoading: false
            });
            throw error;
        }
    },

    deleteAnnouncement: async (businessId: string, id: number) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`businesses/${businessId}/announcements/${id}`);

            // Refetch
            const res = await axios.get(`businesses/${businessId}/announcements`);
            set({
                announcements: res.data,
                currentBusinessId: businessId,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menghapus pengumuman',
                isLoading: false
            });
            throw error;
        }
    }
}));

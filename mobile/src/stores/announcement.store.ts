import { defineStore } from 'pinia';
import axios from '@/lib/axios';

export interface Announcement {
    id: number;
    public_id: string;
    business_id: number;
    title: string;
    content: string;
    type: 'info' | 'penting';
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export const useAnnouncementStore = defineStore('announcement', {
    state: () => ({
        announcements: [] as Announcement[],
        loading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchAnnouncements(businessId: string) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`/businesses/${businessId}/announcements`);
                // Filter only active announcements for the mobile app
                this.announcements = response.data.filter((a: Announcement) => a.status === 'active');
            } catch (err: any) {
                console.error('Failed to fetch announcements:', err);
                this.error = err.response?.data?.message || 'Gagal memuat pengumuman';
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        hasAnnouncements: (state) => state.announcements.length > 0,
        latestAnnouncement: (state) => state.announcements[0] || null,
    }
});

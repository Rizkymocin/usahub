
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/lib/axios'

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
    outlet_id: number | null;
    sales_id: number;
    name: string;
    phone: string;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    status: 'waiting' | 'approved' | 'rejected' | 'installed' | 'installation_rejected' | 'activated';
    admin_note: string | null;
    technician_note: string | null;
    approved_at: string | null;
    installed_at: string | null;
    activated_at: string | null;
    assigned_technician_id: number | null;
    assigned_technician?: { id: number; name: string } | null;
    readiness_confirmations?: ReadinessConfirmation[];
    created_at: string;
    updated_at: string;
    sales?: { id: number; name: string };
    approved_by_user?: { id: number; name: string };
    outlet?: { id: number; name: string };
    business?: { id: number; name: string };
    maintenance_issue_id?: number;
    maintenance_issue?: {
        id: number;
        public_id: string;
        title: string;
        status: string;
    };
}

export const useRegistrationStore = defineStore('registration', () => {
    const registrations = ref<Prospect[]>([]);
    const queue = ref<Prospect[]>([]);
    const loading = ref(false);

    const fetchRegistrations = async () => {
        loading.value = true;
        try {
            const response = await axios.get('/isp/my-prospects');
            registrations.value = response.data.data;
        } catch (error) {
            console.error('Failed to fetch prospects:', error);
        } finally {
            loading.value = false;
        }
    };


    const fetchQueue = async (businessPublicId: string) => {
        loading.value = true;
        try {
            const response = await axios.get(`/businesses/${businessPublicId}/prospects?status=approved`);
            queue.value = response.data.data;
        } catch (error: any) {
            console.error('[InstallationQueue] Failed to fetch installation queue:', error);
            console.error('[InstallationQueue] Error response:', error?.response?.data);
            console.error('[InstallationQueue] Error status:', error?.response?.status);
        } finally {
            loading.value = false;
        }
    };

    const confirmReadiness = async (businessPublicId: string, prospectPublicId: string) => {
        const response = await axios.post(`/businesses/${businessPublicId}/prospects/${prospectPublicId}/confirm-readiness`);
        // Update the queue item in place
        const idx = queue.value.findIndex(p => p.public_id === prospectPublicId);
        if (idx !== -1 && response.data.data) {
            queue.value[idx] = response.data.data;
        }
        return response.data;
    };

    return {
        registrations,
        queue,
        loading,
        fetchRegistrations,
        fetchQueue,
        confirmReadiness
    };
});

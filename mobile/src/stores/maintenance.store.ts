import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/lib/axios';

export interface MaintenanceIssue {
    id: number;
    public_id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    status: string;
    reported_at: string;
    reseller?: {
        name: string;
        address: string;
        phone: string;
        latitude?: string | number;
        longitude?: string | number;
    };
    assigned_technician_id?: number;
    logs?: MaintenanceLog[];
}

export interface MaintenanceLog {
    id: number;
    action_taken: string;
    result: string;
    notes: string;
    created_at: string;
    technician?: {
        name: string;
    };
}

export const useMaintenanceStore = defineStore('maintenance', () => {
    const tasks = ref<MaintenanceIssue[]>([]);
    const history = ref<MaintenanceIssue[]>([]);
    const currentIssue = ref<MaintenanceIssue | null>(null);
    const items = ref<any[]>([]); // Maintenance Inventory Items
    const installations = ref<MaintenanceIssue[]>([]);
    const technicians = ref<any[]>([]); // List of available technicians
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchAssignments(businessId: string) {
        loading.value = true;
        error.value = null;
        try {
            // Fetch issues assigned or pending in the business
            // For now, we fetch all and filter client side or backend handles it.
            // Backend endpoint: /businesses/{public_id}/maintenance-issues
            // We might want to pass a param like ?my_assignments=true in future
            const response = await axios.get(`/businesses/${businessId}/maintenance-issues`, {
                params: { exclude_type: 'installation' }
            });

            const allIssues = response.data;

            // Filter logic (can be moved to backend)
            // Tasks: Pending, Assigned, In Progress
            tasks.value = allIssues.filter((i: any) =>
                ['pending', 'assigned', 'in_progress'].includes(i.status)
            );

            // History: Resolved, Closed
            history.value = allIssues.filter((i: any) =>
                ['resolved', 'closed'].includes(i.status)
            );

        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat tugas';
        } finally {
            loading.value = false;
        }
    }

    async function fetchIssueDetail(businessId: string, issuePublicId: string) {
        loading.value = true;
        try {
            const response = await axios.get(`/businesses/${businessId}/maintenance-issues/${issuePublicId}`);
            currentIssue.value = response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat detail';
        } finally {
            loading.value = false;
        }
    }

    async function fetchItems(businessId: string) {
        try {
            const url = `/businesses/${businessId}/maintenance-items`;
            const response = await axios.get(url);
            items.value = response.data;
        } catch (err: any) {
            console.error('Failed to fetch items', err);
        }
    }

    async function fetchTechnicians(businessId: string) {
        try {
            // Fetch users with roles relevant to technical work
            // Using existing users endpoint
            const response = await axios.get(`/businesses/${businessId}/users`, {
                params: {
                    role: 'teknisi_maintenance,teknisi_pasang_baru'
                }
            });
            // Optionally filter on client side if needed, or trust backend to return all business users
            // For now, returning all business users is fine for "Rekan Kerja"
            technicians.value = response.data.data; // Fixed: Accesing .data property from API response wrapper
        } catch (err: any) {
            console.error('Failed to fetch technicians', err);
        }
    }

    async function fetchInstallations(businessId: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/businesses/${businessId}/maintenance-issues`, {
                params: { type: 'installation' }
            });
            installations.value = response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat antrian pasang';
        } finally {
            loading.value = false;
        }
    }

    async function submitLog(businessId: string, issuePublicId: string, data: { action_taken: string, result: string, notes?: string, items?: any[], photos?: File[], participant_ids?: number[] }) {
        loading.value = true;
        try {
            const formData = new FormData();
            formData.append('action_taken', data.action_taken);
            formData.append('result', data.result);
            if (data.notes) formData.append('notes', data.notes);

            if (data.items && data.items.length > 0) {
                data.items.forEach((item, index) => {
                    formData.append(`items[${index}][item_id]`, String(item.item_id));
                    formData.append(`items[${index}][quantity]`, String(item.quantity));
                    if (item.notes) formData.append(`items[${index}][notes]`, item.notes);
                });
            }

            if (data.participant_ids && data.participant_ids.length > 0) {
                data.participant_ids.forEach((id, index) => {
                    formData.append(`participant_ids[${index}]`, String(id));
                });
            }

            if (data.photos && data.photos.length > 0) {
                data.photos.forEach((photo) => {
                    formData.append('photos[]', photo);
                });
            }

            await axios.post(`/businesses/${businessId}/maintenance-issues/${issuePublicId}/logs`, formData);

            // Refresh details
            await fetchIssueDetail(businessId, issuePublicId);
            // Refresh lists
            await fetchAssignments(businessId);

        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal mengirim laporan';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        tasks,
        history,
        currentIssue,
        items,
        installations,
        technicians,
        loading,
        error,
        fetchAssignments,
        fetchIssueDetail,
        fetchItems,
        fetchTechnicians,
        fetchInstallations,
        submitLog
    };
});

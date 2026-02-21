import axios from "@/lib/axios";

export const dashboardService = {
    getOwnerDashboard: async () => {
        const response = await axios.get('/dashboard/owner');
        return response.data;
    },
    getBusinessDashboard: async (publicId: string) => {
        const response = await axios.get(`/businesses/${publicId}/dashboard`);
        return response.data;
    }
};

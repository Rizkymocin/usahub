import axios from "@/lib/axios";

export const businessService = {
    getBusiness: async (publicId: string) => {
        const response = await axios.get(`/businesses/${publicId}`);
        return response.data;
    },
    listBusinesses: async () => {
        const response = await axios.get('/businesses');
        return response.data;
    },
    getBusinessesByAdmin: async () => {
        const response = await axios.get('/business-by-admin');
        return response.data;
    }
};

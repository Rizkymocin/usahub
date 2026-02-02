import axios from "@/lib/axios";

export const businessService = {
    getBusiness: async (publicId: string) => {
        const response = await axios.get(`/businesses/${publicId}`);
        return response.data;
    }
};

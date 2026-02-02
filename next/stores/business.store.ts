import { create } from 'zustand';
import { BusinessState } from '@/types/business';
import { businessService } from '@/services/business.service';

export const useBusinessStore = create<BusinessState>((set) => ({
    currentBusiness: null,
    isLoading: false,
    error: null,

    fetchBusiness: async (publicId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await businessService.getBusiness(publicId);
            if (response.success) {
                set({ currentBusiness: response.data, isLoading: false });
            } else {
                set({ error: response.message, isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch business',
                isLoading: false
            });
        }
    },

    reset: () => set({ currentBusiness: null, error: null, isLoading: false })
}));

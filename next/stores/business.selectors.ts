import { useBusinessStore } from './business.store';

export const useBusiness = () => useBusinessStore((state) => state.currentBusiness);
export const useBusinessName = () => useBusinessStore((state) => state.currentBusiness?.name);
export const useBusinessLoading = () => useBusinessStore((state) => state.isLoading);
export const useBusinessError = () => useBusinessStore((state) => state.error);
export const useBusinessActions = () => {
    const fetchBusiness = useBusinessStore((state) => state.fetchBusiness);
    const reset = useBusinessStore((state) => state.reset);
    return { fetchBusiness, reset };
};

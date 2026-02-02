export interface Business {
    public_id: string;
    name: string;
    category: string;
    address: string;
    is_active: boolean;
}

export interface BusinessState {
    currentBusiness: Business | null;
    isLoading: boolean;
    error: string | null;

    fetchBusiness: (publicId: string) => Promise<void>;
    reset: () => void;
}

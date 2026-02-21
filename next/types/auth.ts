export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    roles?: any[];
    business_public_id?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}


export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    business_name: string;
    category?: string;
    plan_id?: number;
}
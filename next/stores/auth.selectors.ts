import { useAuthStore } from "./auth.store";

export const useAuthUser = () =>
    useAuthStore((state) => state.user)
export const useIsAuthenticated = () =>
    useAuthStore((state) => !!state.token)
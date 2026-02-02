import axios from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";
import { RegisterData } from "@/types/auth";
import { redirect } from "next/navigation";

export const loginRequest = async (user: string, password: string) => {
    const { data } = await axios.post('/login', { user, password })
    useAuthStore.getState().login(data.data.token, data.data.user)
    // localStorage.setItem('auth-storage', JSON.stringify(data.data))
}

export const fetchMe = async () => {
    try {
        const { data } = await axios.get('/auth/me')
        useAuthStore.getState().setUser(data)
    } catch {
        useAuthStore.getState().logout()
    }
}

export const registerRequest = async (registerData: RegisterData) => {
    const { data } = await axios.post('/register-tenant', registerData)
    useAuthStore.getState().login(data.data.token, data.data.user)
    return data
}

export const logoutRequest = async () => {
    try {
        const { data } = await axios.post('/logout')
        useAuthStore.getState().logout()
        localStorage.removeItem('auth-storage')
        return data
    } catch (error) {
        useAuthStore.getState().logout()
        localStorage.removeItem('auth-storage')
        return error
    }
}
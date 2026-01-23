import axios from "axios"

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', })
export const assetURL = process.env.NEXT_PUBLIC_ASSET_URL || 'http://localhost:8000'

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
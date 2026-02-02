"use client"

import { usePathname, useRouter } from "next/navigation"
import MainLayout from "./MainLayout";
import { useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathName = usePathname();
    const router = useRouter();

    const useMainLayoutPath = [
        "/dashboard"
    ]

    const noLayoutPath = [
        "/auth/login",
        "/auth/register",
    ]

    const useMainLayout = useMainLayoutPath.some(p => pathName.startsWith(p));

    // Auth Guard
    useEffect(() => {
        const checkAuth = () => {
            const storage = localStorage.getItem('auth-storage')
            let isAuthenticated = false

            if (storage) {
                try {
                    const parsed = JSON.parse(storage)
                    isAuthenticated = !!parsed.state?.token
                } catch (e) {
                    console.error("Failed to parse auth storage", e)
                }
            }

            // Guard Dashboard
            if (useMainLayout && !isAuthenticated) {
                router.push('/auth/login')
            }

            // Guard Auth Pages
            if (noLayoutPath.includes(pathName) && isAuthenticated) {
                router.push('/dashboard')
            }
        }

        checkAuth()
    }, [pathName, router, useMainLayout])

    if (noLayoutPath.includes(pathName)) {
        return <>
            {children}
        </>
    }

    if (useMainLayout) {
        return <MainLayout>{children}</MainLayout>
    }

    return <>{children}</>
}
"use client"

import { usePathname } from "next/navigation"
import MainLayout from "./MainLayout";
import { Toaster } from "sonner";

export default function ClientLayout({children}: {children: React.ReactNode}){
    const pathName = usePathname();

    const useMainLayoutPath = [
        "/dashboard"
    ]

    const noLayoutPath = [
        "/auth/login",
        "/auth/register",
        "/qrattendance",
    ]

    if(noLayoutPath.includes(pathName)){
        return <>
            {children}
            <Toaster position="top-right" richColors />
        </>
    }

    const useMainLayout = useMainLayoutPath.some(p => pathName.startsWith(p));
    if(useMainLayout) {
        return <MainLayout>{children}</MainLayout>
    }

    return <>{children}</>
}
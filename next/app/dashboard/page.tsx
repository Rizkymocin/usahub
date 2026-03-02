"use client"

import { useEffect, useState } from "react"
import SuperAdminDashboard from "../components/SuperAdminDashboard"
import OwnerDashboard from "../components/OwnerDashboard"
import BusinessAdminDashboard from "../components/BusinessAdminDashboard"
import IspKasirDashboard from "../components/IspKasirDashboard"

export default function DashboardPage() {
    const [role, setRole] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            const storage = localStorage.getItem("auth-storage")
            if (storage) {
                try {
                    const parsed = JSON.parse(storage)
                    const userRoles = parsed.state?.user?.roles || []

                    const roleNames = userRoles.map((r: { name: string } | string) => typeof r === 'string' ? r : r.name)

                    if (roleNames.includes('owner')) {
                        setRole('owner')
                    } else if (roleNames.includes('super_admin')) {
                        setRole('super_admin')
                    } else if (roleNames.includes('business_admin')) {
                        setRole('business_admin')
                    } else if (roleNames.includes('kasir')) {
                        setRole('kasir')
                    } else {
                        setRole('guest')
                    }
                } catch (e) {
                    console.error("Failed to parse auth storage", e)
                }
            }
            setIsLoading(false)
        }, 0)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (role === 'owner') {
        return <OwnerDashboard />
    }

    if (role === 'super_admin') {
        return <SuperAdminDashboard />
    }

    if (role === 'business_admin') {
        return <BusinessAdminDashboard />
    }

    if (role === 'kasir') {
        return <IspKasirDashboard />
    }

    return (
        <div className="p-4">
            <h1>Unauthorized or Unknown Role</h1>
            <p>Role detected: {role}</p>
        </div>
    )
}
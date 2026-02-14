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
        const storage = localStorage.getItem("auth-storage")
        if (storage) {
            try {
                const parsed = JSON.parse(storage)
                // Access roles array from user object
                const userRoles = parsed.state?.user?.roles || []

                // Determine primary role (prioritize owner > super-admin > business-admin)
                // Note: Response structure shows roles as array of objects or strings depending on context
                // Based on auth.service.ts login response: data.data.user.roles is array of objects
                // But data.data.roles is array of strings ["owner"]

                // Let's check parsed.state.user.roles usually objects if from User model
                // Or verify if we stored simple role list

                // Assuming we stored the whole user object from backend
                // Backend response: user.roles is array of objects {id, name, ...}

                const roleNames = userRoles.map((r: any) => typeof r === 'string' ? r : r.name)

                if (roleNames.includes('owner')) {
                    setRole('owner')
                } else if (roleNames.includes('super_admin')) {
                    setRole('super_admin')
                } else if (roleNames.includes('business_admin')) { // Assuming this role exists
                    setRole('business_admin')
                } else if (roleNames.includes('kasir')) { // Assuming this role exists
                    setRole('kasir')
                } else {
                    setRole('guest')
                }
            } catch (e) {
                console.error("Failed to parse auth storage", e)
            }
        }
        setIsLoading(false)
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
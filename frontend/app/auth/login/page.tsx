"use client"

import { LoginForm } from "@/app/components/auth/LoginForm";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {

    const router = useRouter()

    const handleLogin = async (data: { email: string, password: string }) => {
        setIsLoading(true)

        try {
            const response = await api.post("/api/auth/login", data)

            const { token, user } = response.data

            // simpan token & role
            localStorage.setItem("token", token)
            localStorage.setItem("role", user.role)
            document.cookie = `token=${token}; path=/;`

            console.log("ROLE:", user.role)

            toast.success("Login berhasil, Anda akan masuk ke Dashboard sesaat lagi")
            setTimeout(() => {
                if (user.role === "administrator") {
                    router.push("/dashboard")
                } else {
                    router.push("/dashboard")
                }
            }, 2000)



        } catch (error: any) {
            if (error.response) {
                console.error("Login gagal:", error.response.data.message)
                toast.error(error.response.data.message)
            } else {
                console.error("Server error")
                toast.error("Server error")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const [isLoading, setIsLoading] = useState(false)

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </div>
        </div>
    )
}
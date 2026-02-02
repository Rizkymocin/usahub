"use client"

import { LoginForm } from "@/app/components/auth/LoginForm";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginRequest } from "@/services/auth.service";

export default function LoginPage() {

    const router = useRouter()


    const [isLoading, setIsLoading] = useState(false)
    const handleLogin = async (data: { user: string, password: string }) => {
        setIsLoading(true)
        try {
            await loginRequest(data.user, data.password)
            toast.success("Login berhasil")
            router.push("/dashboard")
        } catch (error) {
            toast.error("Login gagal")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </div>
        </div>
    )
}
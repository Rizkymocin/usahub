"use client"

import { RegisterForm } from "@/app/components/auth/RegisterForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerRequest } from "@/services/auth.service";
import { RegisterData } from "@/types/auth";

export default function RegisterPage() {

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleRegister = async (data: any) => {
        setIsLoading(true)

        if (data.password !== data.password_confirmation) {
            toast.error("Password konfirmasi tidak cocok")
            setIsLoading(false)
            return
        }

        try {
            const registerData: RegisterData = {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
                business_name: data.business_name,
                plan_id: data.plan_id
            }

            const response = await registerRequest(registerData)

            toast.success("Registrasi berhasil! Selamat datang di UsaHub")

            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)

        } catch (err: unknown) {
            const error = err as any;
            if (error.response) {
                console.error("Registrasi gagal:", error.response.data.message)
                toast.error(error.response.data.message || "Gagal mendaftar")
            } else {
                console.error(error.message)
                toast.error("Terjadi kesalahan sistem")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
            </div>
        </div>
    )
}

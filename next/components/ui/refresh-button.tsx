"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface RefreshButtonProps {
    onRefresh: () => void | Promise<void>
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    showToast?: boolean
    successMessage?: string
    errorMessage?: string
}

export function RefreshButton({
    onRefresh,
    variant = "outline",
    size = "default",
    className = "",
    showToast = false,
    successMessage = "Data berhasil dimuat ulang",
    errorMessage = "Gagal memuat ulang data"
}: RefreshButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = async () => {
        try {
            setIsLoading(true)
            await onRefresh()
            if (showToast) {
                toast.success(successMessage)
            }
        } catch (error: any) {
            if (showToast) {
                toast.error(error?.response?.data?.message || errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleRefresh}
            disabled={isLoading}
            className={className}
        >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
    )
}

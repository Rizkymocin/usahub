"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Plus, FolderTree, Trash2 } from "lucide-react"
import { useBusinessName, useBusinessActions, useBusiness } from "@/stores/business.selectors"
import Penjualan from "./Penjualan"
import Pembelian from "./Pembelian"


export default function DetailUsahaAdminPage() {
    const { public_id } = useParams()
    const router = useRouter()
    const businessName = useBusinessName()
    const business = useBusiness()
    const { fetchBusiness } = useBusinessActions()

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchBusiness(id)
        }
    }, [public_id])

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/admin/usaha')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Transaksi pada usaha: {businessName || 'Loading...'}</h1>
                    <p className="text-muted-foreground">ID: {public_id}</p>
                </div>
            </div>

            <Tabs defaultValue="penjualan" className="space-y-4">
                <TabsList className="w-full bg-primary text-primary-foreground">
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground active" value="penjualan">Penjualan</TabsTrigger>
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="pembelian">Pembelian</TabsTrigger>
                </TabsList>

                <TabsContent value="penjualan" className="space-y-4">
                    <Penjualan />
                </TabsContent>
                <TabsContent value="pembelian">
                    <Pembelian />
                </TabsContent >
            </Tabs >
        </div >
    )
}

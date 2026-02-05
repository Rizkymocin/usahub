"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import User from "./User"
import Accounts from "./Accounts"
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
import Outlets from "./Outlets"
import Resellers from "./Resellers"
import Topups from "./Topups"
import Vouchers from "./Vouchers"
import VoucherStockTab from "../../admin/usaha/[public_id]/VoucherStockTab"

export default function DetailUsahaPage() {
    const { public_id } = useParams()
    const router = useRouter()
    const businessName = useBusinessName()
    const business = useBusiness()
    const { fetchBusiness } = useBusinessActions()

    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchBusiness(id)
        }
    }, [public_id])

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/usaha')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Detail Usaha: {businessName || 'Loading...'}</h1>
                    <p className="text-muted-foreground">ID: {public_id}</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList className="w-full">
                    <TabsTrigger value="account">Akun (COA)</TabsTrigger>
                    <TabsTrigger value="users">Pengguna</TabsTrigger>
                    {business?.category === 'isp' && (
                        <>
                            <TabsTrigger value="outlets">Outlet</TabsTrigger>
                            <TabsTrigger value="resellers">Reseller</TabsTrigger>
                            <TabsTrigger value="topups">Topup</TabsTrigger>
                            <TabsTrigger value="vouchers">Voucher</TabsTrigger>
                        </>
                    )}
                    <TabsTrigger value="transaction" disabled>Transaksi (Coming Soon)</TabsTrigger>
                    <TabsTrigger value="report" disabled>Laporan (Coming Soon)</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-4">
                    <Accounts />
                </TabsContent>
                <TabsContent value="users">
                    <User />
                </TabsContent >
                {business?.category === 'isp' && (
                    <>
                        <TabsContent value="outlets"><Outlets /></TabsContent>
                        <TabsContent value="resellers"><Resellers /></TabsContent>
                        <TabsContent value="topups"><Topups /></TabsContent>
                        <TabsContent value="vouchers"><Vouchers /></TabsContent>
                    </>
                )}
            </Tabs >
        </div >
    )
}
"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import User from "./User" // Need to locate correct path or duplicate these components if they rely on specific path params/context
import Accounts from "./Accounts" // Reusing components from sibling
import User from "./User" // Reusing components from sibling

// We need to check if these components (Accounts, User, etc.) use `useParams()`.
// If they do, they expect `public_id`. Since our route is `[public_id]`, it should work fine.
// BUT, if they rely on other context, we might need to adjust.
// Accounts.tsx in sibling uses `useParams().public_id`. That matches.
// User.tsx in sibling uses `useParams().public_id`. That matches.

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
import Outlets from "../../../usaha/[public_id]/Outlets"
import Resellers from "../../../usaha/[public_id]/Resellers"
import Topups from "../../../usaha/[public_id]/Topups"
import Vouchers from "../../../usaha/[public_id]/Vouchers"


export default function DetailUsahaAdminPage() {
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
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/admin/usaha')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Detail Usaha: {businessName || 'Loading...'}</h1>
                    <p className="text-muted-foreground">ID: {public_id}</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="account">Manajemen Akun (COA)</TabsTrigger>
                    <TabsTrigger value="users">Manajemen Pengguna</TabsTrigger>
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

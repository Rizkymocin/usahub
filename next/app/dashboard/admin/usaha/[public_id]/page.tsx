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
import Outlets from "./Outlets"
import Resellers from "./Resellers"
import Topups from "./Topups"
import Stock from "./Stock"
import Vouchers from "./Vouchers"
import VoucherSales from "./VoucherSales"
import VoucherStockTab from "./VoucherStockTab"


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
                    <h1 className="text-2xl font-bold">Detail Usaha: {businessName || 'Loading...'}</h1>
                    <p className="text-muted-foreground">ID: {public_id}</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList className="w-full bg-primary text-primary-foreground">
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="account">Akun (COA)</TabsTrigger>
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="users">Pengguna</TabsTrigger>
                    {isMounted && business?.category === 'isp' && <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="outlets">Outlet</TabsTrigger>}
                    {isMounted && business?.category === 'isp' && <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="resellers">Reseller</TabsTrigger>}
                    {isMounted && business?.category === 'isp' && <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="stocks">Permintaan Stok Voucher</TabsTrigger>}
                    {isMounted && business?.category === 'isp' && <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="vouchers">Voucher</TabsTrigger>}
                    {isMounted && business?.category === 'isp' && <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="voucher-stocks">Stok Voucher</TabsTrigger>}
                </TabsList>

                <TabsContent value="account" className="space-y-4">
                    <Accounts />
                </TabsContent>
                <TabsContent value="users">
                    <User />
                </TabsContent >

                {isMounted && business?.category === 'isp' && <TabsContent value="outlets"><Outlets /></TabsContent>}
                {isMounted && business?.category === 'isp' && <TabsContent value="resellers"><Resellers /></TabsContent>}
                {isMounted && business?.category === 'isp' && <TabsContent value="stocks"><Stock /></TabsContent>}
                {isMounted && business?.category === 'isp' && <TabsContent value="vouchers"><Vouchers /></TabsContent>}
                {isMounted && business?.category === 'isp' && <TabsContent value="voucher-stocks"><VoucherStockTab /></TabsContent>}
            </Tabs >
        </div >
    )
}

"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { useBusinessName, useBusinessActions } from "@/stores/business.selectors"
import Penjualan from "./Penjualan"
import Pembelian from "./Pembelian"
import PembayaranTab from "./PembayaranTab"


export default function DetailUsahaAdminPage() {
    const { public_id } = useParams()
    const router = useRouter()
    const businessName = useBusinessName()
    const { fetchBusiness } = useBusinessActions()

    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchBusiness(id)
        }
    }, [public_id, fetchBusiness])

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
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="pembayaran">Pembayaran</TabsTrigger>
                </TabsList>

                <TabsContent value="penjualan" className="space-y-4">
                    <Penjualan />
                </TabsContent>
                <TabsContent value="pembelian">
                    <Pembelian />
                </TabsContent >
                <TabsContent value="pembayaran">
                    <PembayaranTab />
                </TabsContent >
            </Tabs >
        </div >
    )
}

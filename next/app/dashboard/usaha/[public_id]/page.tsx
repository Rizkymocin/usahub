"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import User from "./User"
import Accounts from "./Accounts"
import { ArrowLeft } from "lucide-react"
import { useBusinessName, useBusinessActions } from "@/stores/business.selectors"

export default function DetailUsahaPage() {
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
                </TabsList>

                <TabsContent value="account" className="space-y-4">
                    <Accounts />
                </TabsContent>
                <TabsContent value="users">
                    <User />
                </TabsContent >
            </Tabs >
        </div >
    )
}
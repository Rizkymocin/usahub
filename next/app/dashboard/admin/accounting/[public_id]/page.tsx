"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ArrowLeft } from "lucide-react"
import { useBusinessName, useBusinessActions } from "@/stores/business.selectors"
import Accounts from "./Accounts"
import Journal from "./Journal"
import Periods from "./Periods"
import ManualJournal from "./ManualJournal"


export default function DetailAkuntansiAdminPage() {
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
                    <h1 className="text-2xl font-bold">Detail Usaha: {businessName || 'Loading...'}</h1>
                    <p className="text-muted-foreground">ID: {public_id}</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList className="w-full bg-primary text-primary-foreground">
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="account">Akun (COA)</TabsTrigger>
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="journal">Jurnal</TabsTrigger>
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="periods">Periode</TabsTrigger>
                    <TabsTrigger className="active:bg-primary active:text-primary text-primary-foreground" value="manual">Jurnal Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-4">
                    <Accounts />
                </TabsContent>

                <TabsContent value="journal" className="space-y-4">
                    <Journal />
                </TabsContent>

                <TabsContent value="periods" className="space-y-4">
                    <Periods />
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                    <ManualJournal />
                </TabsContent>
            </Tabs >
        </div >
    )
}

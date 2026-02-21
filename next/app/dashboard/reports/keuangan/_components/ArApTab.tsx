"use client"

import { useEffect, useState } from "react"
import { reportService, ReportFilters } from "@/services/report.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Building2, AlertTriangle } from "lucide-react"

export default function ArApTab({ filters, trigger }: { filters: ReportFilters, trigger: number }) {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [trigger, filters.business_id])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const result = await reportService.getArAp(filters)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch AR/AP", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="py-12 text-center text-muted-foreground animate-pulse">Memuat data Piutang & Hutang...</div>
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Piutang (AR)</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            Rp {data.total_receivables?.toLocaleString('id-ID')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total tagihan belum terbayar oleh pelanggan.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hutang (AP)</CardTitle>
                        <Building2 className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">
                            Rp {data.total_payables?.toLocaleString('id-ID')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total kewajiban tagihan kepada pemasok.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-dashed bg-muted/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Rincian Jatuh Tempo (Segera Hadir)
                    </CardTitle>
                    <CardDescription>Lapisan detail AR/AP berdasarkan kontak belum tersedia.</CardDescription>
                </CardHeader>
                <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground max-w-lg mb-4">
                        Modul rincian umur piutang dan hutang (Aging Report) sedang dikonsep. Nanti Anda akan dapat melihat histori debitur teratas dan mengelola tagihan langsung dari sini.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

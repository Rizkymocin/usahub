"use client"

import { useEffect, useState } from "react"
import { useAuthUser } from "@/stores/auth.selectors"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"
import ProfitLossTab from "./_components/ProfitLossTab"

import { Filter } from "lucide-react"
import BusinessPerformanceTab from "./_components/BusinessPerformanceTab"
import CashFlowTab from "./_components/CashFlowTab"
import ArApTab from "./_components/ArApTab"
import GeneralLedgerTab from "./_components/GeneralLedgerTab"

export default function LaporanKeuanganPage() {
    const user = useAuthUser()
    const [businesses, setBusinesses] = useState<any[]>([])

    // Filters
    const [selectedBusiness, setSelectedBusiness] = useState<string>("all")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")

    // Trigger to re-fetch inner components
    const [filterTrigger, setFilterTrigger] = useState(0)

    useEffect(() => {
        fetchBusinesses()
    }, [])

    const fetchBusinesses = async () => {
        try {
            const { data } = await axios.get('businesses')
            if (data.success) {
                setBusinesses(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch businesses", error)
        }
    }

    const handleApplyFilter = () => {
        setFilterTrigger(prev => prev + 1)
    }

    const isOwner = user?.roles?.some((r: any) => (typeof r === 'string' ? r : r.name) === 'owner') || user?.role === 'owner'

    if (!isOwner) {
        return <div className="p-6">Akses ditolak. Fitur ini hanya untuk Owner.</div>
    }

    const filters = {
        business_id: selectedBusiness !== "all" ? selectedBusiness : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan Konsolidasi</h1>
                    <p className="text-muted-foreground mt-1">Pantau performa keuangan seluruh usaha Anda</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-white p-3 rounded-md border shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Usaha:</span>
                        <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Semua Usaha" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Usaha</SelectItem>
                                {businesses.map(b => (
                                    <SelectItem key={b.public_id} value={b.public_id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="w-[140px]"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            className="w-[140px]"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <Button onClick={handleApplyFilter} size="icon" variant="secondary">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="profit-loss" className="space-y-4">
                <TabsList className="w-full bg-primary text-primary-foreground">
                    <TabsTrigger value="profit-loss" className="active:bg-primary active:text-primary text-primary-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Laba Rugi</TabsTrigger>
                    <TabsTrigger value="performance" className="active:bg-primary active:text-primary text-primary-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Performa Usaha</TabsTrigger>
                    <TabsTrigger value="cashflow" className="active:bg-primary active:text-primary text-primary-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Arus Kas</TabsTrigger>
                    <TabsTrigger value="arap" className="active:bg-primary active:text-primary text-primary-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Piutang & Hutang</TabsTrigger>
                    <TabsTrigger value="ledger" className="active:bg-primary active:text-primary text-primary-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Buku Besar</TabsTrigger>
                </TabsList>

                <TabsContent value="profit-loss">
                    <ProfitLossTab filters={filters} trigger={filterTrigger} />
                </TabsContent>

                <TabsContent value="performance">
                    <BusinessPerformanceTab filters={filters} trigger={filterTrigger} />
                </TabsContent>

                <TabsContent value="cashflow">
                    <CashFlowTab filters={filters} trigger={filterTrigger} />
                </TabsContent>

                <TabsContent value="arap">
                    <ArApTab filters={filters} trigger={filterTrigger} />
                </TabsContent>

                <TabsContent value="ledger">
                    <GeneralLedgerTab filters={filters} trigger={filterTrigger} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

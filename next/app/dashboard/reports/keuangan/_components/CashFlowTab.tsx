"use client"

import { useEffect, useState } from "react"
import { reportService, ReportFilters } from "@/services/report.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, HandCoins } from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

export default function CashFlowTab({ filters, trigger }: { filters: ReportFilters, trigger: number }) {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [trigger, filters.business_id])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const result = await reportService.getCashFlow(filters)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch Cash Flow", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="py-12 text-center text-muted-foreground animate-pulse">Memuat data Arus Kas...</div>
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uang Masuk (Inflow)</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            Rp {data.inflow?.toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uang Keluar (Outflow)</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">
                            Rp {data.outflow?.toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Arus Kas Bersih</CardTitle>
                        <HandCoins className={`h-4 w-4 ${data.net_cash_flow >= 0 ? 'text-primary' : 'text-rose-600'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data.net_cash_flow >= 0 ? 'text-foreground' : 'text-rose-600'}`}>
                            Rp {data.net_cash_flow?.toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tren Arus Kas (6 Bulan Terakhir)</CardTitle>
                    <CardDescription>Grafik pergerakan uang masuk, uang keluar, dan arus kas bersih.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full mt-4">
                        {data.chart_data && data.chart_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={data.chart_data}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis
                                        tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`}
                                        width={80}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => ['Rp ' + Number(value).toLocaleString('id-ID'), '']}
                                        labelFormatter={(label) => `Bulan: ${label}`}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="inflow"
                                        name="Uang Masuk"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="outflow"
                                        name="Uang Keluar"
                                        stroke="#e11d48"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="net_cash_flow"
                                        name="Kas Bersih"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Tidak ada data tren arus kas dalam periode yang dipilih.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { reportService, ProfitAndLossData, ReportFilters } from "@/services/report.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ProfitLossTab({ filters, trigger }: { filters: ReportFilters, trigger: number }) {
    const [data, setData] = useState<ProfitAndLossData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [trigger, filters.business_id]) // Re-fetch when trigger or business changes

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const result = await reportService.getProfitAndLoss(filters)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch P&L", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="py-12 text-center text-muted-foreground animate-pulse">Memuat data Laba Rugi...</div>
    }

    if (!data) return null;

    const { summary, chart_data } = data;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.revenue.formatted}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.expense.formatted}</div>
                    </CardContent>
                </Card>
                <Card className={summary.net_income.value >= 0 ? "border-emerald-200 bg-emerald-50/30" : "border-rose-200 bg-rose-50/30"}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Laba Bersih</CardTitle>
                        <Activity className={summary.net_income.value >= 0 ? "h-4 w-4 text-emerald-600" : "h-4 w-4 text-rose-600"} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.net_income.value >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {summary.net_income.formatted}
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">
                            Margin: {summary.net_margin_percentage}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tren Pendapatan vs Pengeluaran (6 Bulan Terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chart_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

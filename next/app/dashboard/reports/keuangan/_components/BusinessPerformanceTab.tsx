"use client"

import { useEffect, useState } from "react"
import { reportService, BusinessPerformanceData, ReportFilters } from "@/services/report.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function BusinessPerformanceTab({ filters, trigger }: { filters: ReportFilters, trigger: number }) {
    const [data, setData] = useState<BusinessPerformanceData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [trigger, filters.business_id])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const result = await reportService.getBusinessPerformance(filters)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch Business Performance", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="py-12 text-center text-muted-foreground animate-pulse">Memuat data Performa Usaha...</div>
    }

    if (!data.length) {
        return <div className="py-12 text-center text-muted-foreground">Belum ada data untuk periode ini.</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Perbandingan Pendapatan & Pengeluaran Antar Usaha</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis
                                    tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip
                                    formatter={(value: any) => ['Rp ' + Number(value).toLocaleString('id-ID'), '']}
                                    labelFormatter={(label) => `Usaha: ${label}`}
                                />
                                <Legend />
                                <Bar dataKey="revenue" name="Pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rincian Performa</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                <tr>
                                    <th className="px-4 py-3">Nama Usaha</th>
                                    <th className="px-4 py-3 text-right">Pendapatan</th>
                                    <th className="px-4 py-3 text-right">Pengeluaran</th>
                                    <th className="px-4 py-3 text-right">Laba Bersih</th>
                                    <th className="px-4 py-3 text-right">Margin (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, idx) => (
                                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{row.name}</td>
                                        <td className="px-4 py-3 text-right text-emerald-600 font-medium">{row.revenue_formatted}</td>
                                        <td className="px-4 py-3 text-right text-rose-600">{row.expense_formatted}</td>
                                        <td className={`px-4 py-3 text-right font-bold ${row.net_income >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {row.net_income_formatted}
                                        </td>
                                        <td className="px-4 py-3 text-right">{row.margin_percentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

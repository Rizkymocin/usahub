"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { useAuthUser } from "@/stores/auth.selectors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface ActivityLog {
    id: number
    log_name: string
    description: string
    subject_type: string | null
    subject_id: string | null
    causer_type: string | null
    causer_id: string | null
    properties: {
        attributes?: Record<string, any>
        old?: Record<string, any>
        ip?: string
        user_agent?: string
    }
    created_at: string
    causer?: {
        name: string
    }
    subject?: {
        name?: string
        title?: string
    }
}

export default function ActivityLogPage() {
    const user = useAuthUser()
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        if (user?.business_public_id) {
            fetchLogs(page)
        }
    }, [user, page])

    const fetchLogs = async (currentPage: number) => {
        setIsLoading(true)
        try {
            const { data } = await axios.get(`businesses/${user?.business_public_id}/activity-logs`, {
                params: { page: currentPage }
            })
            setLogs(data.data)
            setTotalPages(data.last_page)
        } catch (error) {
            console.error("Failed to fetch activity logs", error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatSubjectType = (type: string | null) => {
        if (!type) return "-"
        return type.split('\\').pop()
    }

    const renderProperties = (properties: ActivityLog['properties']) => {
        if (!properties.attributes && !properties.old) return <p className="text-sm text-gray-500">Tidak ada detail perubahan.</p>

        return (
            <div className="space-y-4">
                {properties.old && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-red-600">Data Lama:</h4>
                        <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-40 border border-red-100">
                            {JSON.stringify(properties.old, null, 2)}
                        </pre>
                    </div>
                )}
                {properties.attributes && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-green-600">Data Baru:</h4>
                        <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-40 border border-green-100">
                            {JSON.stringify(properties.attributes, null, 2)}
                        </pre>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2 border-t pt-2">
                    <div>IP: {properties.ip || '-'}</div>
                    <div>Agent: {properties.user_agent || '-'}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas</h1>
                    <p className="text-muted-foreground mt-1">Riwayat aktivitas pengguna dalam sistem</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Aktivitas</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Waktu</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subjek</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {logs.length === 0 ? (
                                            <tr className="border-b transition-colors hover:bg-muted/50">
                                                <td colSpan={5} className="p-4 align-middle text-center py-8 text-muted-foreground">
                                                    Belum ada aktivitas tercatat
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.map((log) => (
                                                <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle whitespace-nowrap">
                                                        {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                                                    </td>
                                                    <td className="p-4 align-middle font-medium">
                                                        {log.causer?.name || "System"}
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="outline" className="capitalize">
                                                            {log.description}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-xs">{formatSubjectType(log.subject_type)}</span>
                                                            <span className="text-xs text-muted-foreground">ID: {log.subject_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Detail Aktivitas</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="py-4">
                                                                    {renderProperties(log.properties)}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-2">
                                <div className="text-sm text-muted-foreground">
                                    Halaman {page} dari {totalPages}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

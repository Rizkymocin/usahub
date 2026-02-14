"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Lock, LockOpen, RefreshCw } from "lucide-react"

interface AccountingPeriod {
    id: number
    period_name: string
    start_date: string
    end_date: string
    status: 'open' | 'closed' | 'locked'
    closed_at: string | null
    closed_by_user_id: number | null
}

export default function Periods() {
    const { public_id } = useParams()
    const [periods, setPeriods] = useState<AccountingPeriod[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        action: 'close' | 'reopen' | null
        period: AccountingPeriod | null
    }>({ open: false, action: null, period: null })

    const fetchPeriods = async () => {
        try {
            setLoading(true)
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            const response = await axios.get(`/businesses/${id}/accounting-periods`)
            if (response.data.success) {
                setPeriods(response.data.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch periods')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (public_id) {
            fetchPeriods()
        }
    }, [public_id])

    const handleClosePeriod = async (period: AccountingPeriod) => {
        try {
            setActionLoading(period.id)
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            const response = await axios.post(`/businesses/${id}/accounting-periods/${period.id}/close`)

            if (response.data.success) {
                toast.success('Period closed successfully')
                fetchPeriods()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to close period')
        } finally {
            setActionLoading(null)
            setConfirmDialog({ open: false, action: null, period: null })
        }
    }

    const handleReopenPeriod = async (period: AccountingPeriod) => {
        try {
            setActionLoading(period.id)
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            const response = await axios.post(`/businesses/${id}/accounting-periods/${period.id}/reopen`)

            if (response.data.success) {
                toast.success('Period reopened successfully')
                fetchPeriods()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reopen period')
        } finally {
            setActionLoading(null)
            setConfirmDialog({ open: false, action: null, period: null })
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-green-500">🟢 Open</Badge>
            case 'closed':
                return <Badge className="bg-yellow-500">🟡 Closed</Badge>
            case 'locked':
                return <Badge className="bg-red-500">🔴 Locked</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Accounting Periods</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPeriods}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading periods...</div>
                ) : periods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No accounting periods found. Periods are created automatically when transactions occur.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period Name</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periods.map((period) => (
                                <TableRow key={period.id}>
                                    <TableCell className="font-medium">{period.period_name}</TableCell>
                                    <TableCell>{formatDate(period.start_date)}</TableCell>
                                    <TableCell>{formatDate(period.end_date)}</TableCell>
                                    <TableCell>{getStatusBadge(period.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {period.status === 'open' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setConfirmDialog({ open: true, action: 'close', period })}
                                                disabled={actionLoading === period.id}
                                            >
                                                <Lock className="h-4 w-4 mr-2" />
                                                Close
                                            </Button>
                                        )}
                                        {period.status === 'closed' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setConfirmDialog({ open: true, action: 'reopen', period })}
                                                disabled={actionLoading === period.id}
                                            >
                                                <LockOpen className="h-4 w-4 mr-2" />
                                                Reopen
                                            </Button>
                                        )}
                                        {period.status === 'locked' && (
                                            <span className="text-sm text-muted-foreground">Locked</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, period: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmDialog.action === 'close' ? 'Close Period' : 'Reopen Period'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.action === 'close' ? (
                                <>
                                    Are you sure you want to close period <strong>{confirmDialog.period?.period_name}</strong>?
                                    <br /><br />
                                    No new journal entries can be posted to this period after closing.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to reopen period <strong>{confirmDialog.period?.period_name}</strong>?
                                    <br /><br />
                                    New journal entries can be posted to this period again.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (confirmDialog.period) {
                                    if (confirmDialog.action === 'close') {
                                        handleClosePeriod(confirmDialog.period)
                                    } else {
                                        handleReopenPeriod(confirmDialog.period)
                                    }
                                }
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}

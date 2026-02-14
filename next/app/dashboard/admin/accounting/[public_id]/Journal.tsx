"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { BookOpen, Calendar, FileText, TrendingDown, TrendingUp, RefreshCcw } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface JournalLine {
    id: number
    account_code: string
    account_name: string
    direction: "DEBIT" | "CREDIT"
    amount: number
    finance_user_name?: string
    customer_name?: string
    channel_type?: string
}

interface JournalEntry {
    id: number
    journal_date: string
    event_code: string
    source_type: string
    source_id: number
    description: string
    context_json: any
    created_at: string
    lines: JournalLine[]
    total_debit: number
    total_credit: number
}

export default function Journal() {
    const { public_id } = useParams()
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    useEffect(() => {
        if (public_id) {
            fetchJournalEntries()
        }
    }, [public_id])

    const fetchJournalEntries = async () => {
        try {
            setIsLoading(true)
            const { data } = await axios.get(`businesses/${public_id}/journal-entries`)
            if (data.success) {
                setEntries(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch journal entries:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRowClick = (entry: JournalEntry) => {
        setSelectedEntry(entry)
        setIsDetailOpen(true)
    }

    const getEventBadgeColor = (eventCode: string) => {
        switch (eventCode) {
            case "EVT_VOUCHER_SOLD":
                return "bg-green-500/10 text-green-700 border-green-500/20"
            case "EVT_RECEIVABLE_COLLECTED":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20"
            case "EVT_PURCHASE_PAID":
                return "bg-orange-500/10 text-orange-700 border-orange-500/20"
            case "EVT_PURCHASE_ON_CREDIT":
                return "bg-purple-500/10 text-purple-700 border-purple-500/20"
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20"
        }
    }

    const getEventLabel = (eventCode: string) => {
        const labels: Record<string, string> = {
            EVT_VOUCHER_SOLD: "Penjualan Voucher",
            EVT_RECEIVABLE_COLLECTED: "Pembayaran Piutang",
            EVT_PURCHASE_PAID: "Pembelian Tunai",
            EVT_PURCHASE_ON_CREDIT: "Pembelian Kredit",
        }
        return labels[eventCode] || eventCode
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">Jurnal Transaksi</h2>
                            <p className="text-sm text-muted-foreground font-normal">
                                Catatan jurnal akuntansi untuk semua transaksi bisnis
                            </p>
                        </div>
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchJournalEntries} disabled={isLoading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading journal entries...</div>
                ) : entries.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Belum ada jurnal transaksi.</div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Kredit</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry) => (
                                    <TableRow
                                        key={entry.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleRowClick(entry)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {format(new Date(entry.journal_date + 'Z'), "dd MMM yyyy", { locale: localeId })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(entry.journal_date + 'Z'), "HH:mm")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getEventBadgeColor(entry.event_code)}>
                                                {getEventLabel(entry.event_code)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-start gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <div>{entry.description}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {entry.lines.length} baris jurnal
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="flex items-center justify-end gap-1 text-green-600">
                                                <TrendingUp className="h-3 w-3" />
                                                {formatCurrency(entry.total_debit)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="flex items-center justify-end gap-1 text-red-600">
                                                <TrendingDown className="h-3 w-3" />
                                                {formatCurrency(entry.total_credit)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {Math.abs(entry.total_debit - entry.total_credit) < 0.01 ? (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                                                    Balanced
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                                                    Unbalanced
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detail Jurnal Transaksi</DialogTitle>
                            <DialogDescription>
                                {selectedEntry && format(new Date(selectedEntry.journal_date), "dd MMMM yyyy HH:mm", { locale: localeId })}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedEntry && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Event</div>
                                        <Badge variant="outline" className={getEventBadgeColor(selectedEntry.event_code)}>
                                            {getEventLabel(selectedEntry.event_code)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Deskripsi</div>
                                        <div className="text-sm">{selectedEntry.description}</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Baris Jurnal</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Akun</TableHead>
                                                    <TableHead>Posisi</TableHead>
                                                    <TableHead className="text-right">Jumlah</TableHead>
                                                    <TableHead>Info</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedEntry.lines.map((line) => (
                                                    <TableRow key={line.id}>
                                                        <TableCell>
                                                            <div className="font-mono text-sm">{line.account_code}</div>
                                                            <div className="text-sm text-muted-foreground">{line.account_name}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    line.direction === "DEBIT"
                                                                        ? "bg-green-500/10 text-green-700 border-green-500/20"
                                                                        : "bg-red-500/10 text-red-700 border-red-500/20"
                                                                }
                                                            >
                                                                {line.direction}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {formatCurrency(line.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs space-y-1">
                                                                {line.finance_user_name && (
                                                                    <div>👤 {line.finance_user_name}</div>
                                                                )}
                                                                {line.customer_name && (
                                                                    <div>🏪 {line.customer_name}</div>
                                                                )}
                                                                {line.channel_type && (
                                                                    <div className="text-muted-foreground">
                                                                        📍 {line.channel_type}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Total Debit: <span className="font-mono text-green-600">{formatCurrency(selectedEntry.total_debit)}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Kredit: <span className="font-mono text-red-600">{formatCurrency(selectedEntry.total_credit)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

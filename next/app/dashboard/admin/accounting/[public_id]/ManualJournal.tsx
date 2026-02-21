"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PencilLine, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"

interface TransactionType {
    event_code: string
    label: string
    debit: string
    credit: string
}

const TRANSACTION_TYPES: TransactionType[] = [
    {
        event_code: "EVT_PRIVE",
        label: "Prive (Penarikan Pemilik)",
        debit: "Laba Ditahan (3020)",
        credit: "Kas (1010)",
    },
    {
        event_code: "EVT_EQUITY_INVESTED",
        label: "Setoran Modal Pemilik",
        debit: "Kas (1010)",
        credit: "Modal Pemilik (3010)",
    },
    {
        event_code: "EVT_INVESTOR_EQUITY",
        label: "Investasi Saham Pihak Ketiga",
        debit: "Kas (1010)",
        credit: "Saham Pihak Ketiga (3030)",
    },
    {
        event_code: "EVT_TAX_PAID_PPH",
        label: "Pembayaran Pajak PPh",
        debit: "Pajak PPh (5070)",
        credit: "Kas (1010)",
    },
    {
        event_code: "EVT_TAX_PAID_ISP",
        label: "Pembayaran Pajak ISP",
        debit: "Pajak ISP (5080)",
        credit: "Kas (1010)",
    },
    {
        event_code: "EVT_SIMPANAN_POKOK",
        label: "Simpanan Pokok Koperasi",
        debit: "Simpanan Pokok (5090)",
        credit: "Kas (1010)",
    },
    {
        event_code: "EVT_SIMPANAN_WAJIB",
        label: "Simpanan Wajib Koperasi",
        debit: "Simpanan Wajib (5100)",
        credit: "Kas (1010)",
    },
    {
        event_code: "EVT_IURAN_KOPERASI",
        label: "Iuran Koperasi",
        debit: "Iuran Koperasi (5110)",
        credit: "Kas (1010)",
    },
]

export default function ManualJournal() {
    const { public_id } = useParams()
    const businessId = Array.isArray(public_id) ? public_id[0] : public_id

    const [eventCode, setEventCode] = useState("")
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const selectedType = TRANSACTION_TYPES.find(t => t.event_code === eventCode)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!eventCode) {
            toast.error("Pilih jenis transaksi terlebih dahulu")
            return
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error("Masukkan nominal yang valid")
            return
        }

        setIsSubmitting(true)
        try {
            await axios.post(`/businesses/${businessId}/manual-journals`, {
                event_code: eventCode,
                date,
                amount: Number(amount),
                description,
            })
            toast.success("Jurnal manual berhasil dicatat")
            // Reset form
            setEventCode("")
            setAmount("")
            setDescription("")
            setDate(format(new Date(), "yyyy-MM-dd"))
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mencatat jurnal")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PencilLine className="h-5 w-5" />
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Jurnal Manual</h2>
                        <p className="text-sm text-muted-foreground font-normal">
                            Catat transaksi akuntansi yang tidak tercakup oleh sistem otomatis
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    {/* Transaction Type */}
                    <div className="space-y-2">
                        <Label>Jenis Transaksi</Label>
                        <Select value={eventCode} onValueChange={setEventCode}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis transaksi..." />
                            </SelectTrigger>
                            <SelectContent>
                                {TRANSACTION_TYPES.map(t => (
                                    <SelectItem key={t.event_code} value={t.event_code}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Debit/Credit Preview */}
                    {selectedType && (
                        <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Efek Jurnal</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">DEBIT</Badge>
                                    <span className="text-sm">{selectedType.debit}</span>
                                    {amount && <span className="ml-auto text-sm font-mono text-green-600">{formatCurrency(Number(amount))}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
                                    <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">CREDIT</Badge>
                                    <span className="text-sm">{selectedType.credit}</span>
                                    {amount && <span className="ml-auto text-sm font-mono text-red-600">{formatCurrency(Number(amount))}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date */}
                    <div className="space-y-2">
                        <Label>Tanggal Transaksi</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            max={format(new Date(), "yyyy-MM-dd")}
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label>Nominal (Rp)</Label>
                        <Input
                            type="number"
                            min="0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Contoh: 500000"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Keterangan</Label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Contoh: Penarikan prive bulan Februari 2026"
                            maxLength={500}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting || !eventCode}
                        className="w-full"
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan Jurnal"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

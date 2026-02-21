"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "@/lib/axios"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function PembayaranTab() {
    const { public_id } = useParams()
    const businessId = Array.isArray(public_id) ? public_id[0] : public_id

    const [receivables, setReceivables] = useState<any[]>([])
    const [payables, setPayables] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [accounts, setAccounts] = useState<any[]>([])

    // Payment Dialog State
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [paymentType, setPaymentType] = useState<"receivable" | "payable">("receivable")
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentAccountCode, setPaymentAccountCode] = useState("")
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [paymentDescription, setPaymentDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [recRes, payRes, accRes] = await Promise.all([
                axios.get(`/businesses/${businessId}/payments/pending?type=receivable`),
                axios.get(`/businesses/${businessId}/payments/pending?type=payable`),
                axios.get(`/businesses/${businessId}/accounts`)
            ])

            setReceivables(recRes.data.data)
            setPayables(payRes.data.data)

            // Filter Kas & Bank accounts (1010, 1020)
            const kasBankAccounts = accRes.data.data.filter((acc: any) =>
                acc.code.startsWith('1010') || acc.code.startsWith('1020')
            )
            setAccounts(kasBankAccounts)
        } catch (error) {
            console.error(error)
            toast.error("Gagal mengambil data pembayaran")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (businessId) {
            fetchData()
        }
    }, [businessId])

    const openPaymentDialog = (item: any, type: "receivable" | "payable") => {
        setSelectedItem(item)
        setPaymentType(type)
        setPaymentAmount(item.balance.toString())
        setPaymentDescription(`Pembayaran untuk ${item.description}`)
        // Find default account (Kas)
        const defaultAcc = accounts.find(a => a.code === '1010')
        if (defaultAcc) setPaymentAccountCode(defaultAcc.code)
        setIsPaymentDialogOpen(true)
    }

    const handlePaymentSubmit = async () => {
        if (!paymentAccountCode) {
            toast.error("Pilih akun pembayaran (Kas/Bank)")
            return
        }
        if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
            toast.error("Masukkan nominal pembayaran yang valid")
            return
        }

        setIsSubmitting(true)
        try {
            await axios.post(`/businesses/${businessId}/payments`, {
                payment_date: paymentDate,
                type: paymentType,
                account_code: selectedItem.account_code,
                payment_account_code: paymentAccountCode,
                amount: Number(paymentAmount),
                reference_key: selectedItem.reference_key,
                description: paymentDescription
            })

            toast.success("Pembayaran berhasil dicatat")
            setIsPaymentDialogOpen(false)
            fetchData() // Refresh data
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || "Gagal memproses pembayaran")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <Tabs defaultValue="piutang">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="piutang">Penerimaan (Piutang)</TabsTrigger>
                    <TabsTrigger value="hutang">Pengeluaran (Hutang)</TabsTrigger>
                </TabsList>

                <TabsContent value="piutang" className="mt-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total Tagihan</TableHead>
                                    <TableHead>Sisa Tagihan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading data...</TableCell>
                                    </TableRow>
                                ) : receivables.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada piutang pending</TableCell>
                                    </TableRow>
                                ) : (
                                    receivables.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{format(new Date(item.date), 'dd MMM yyyy', { locale: id })}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.customer || '-'}</TableCell>
                                            <TableCell>{formatCurrency(item.original_amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-red-500 border-red-500 font-semibold">
                                                    {formatCurrency(item.balance)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => openPaymentDialog(item, 'receivable')}>
                                                    Terima Pembayaran
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="hutang" className="mt-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Penerima / Teknisi</TableHead>
                                    <TableHead>Total Hutang</TableHead>
                                    <TableHead>Sisa Hutang</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading data...</TableCell>
                                    </TableRow>
                                ) : payables.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada hutang pending</TableCell>
                                    </TableRow>
                                ) : (
                                    payables.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{format(new Date(item.date), 'dd MMM yyyy', { locale: id })}</TableCell>
                                            <TableCell>
                                                <div>{item.description}</div>
                                                <div className="text-xs text-muted-foreground">{item.account_name}</div>
                                            </TableCell>
                                            <TableCell>{item.finance_user || '-'}</TableCell>
                                            <TableCell>{formatCurrency(item.original_amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-orange-500 border-orange-500 font-semibold">
                                                    {formatCurrency(item.balance)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => openPaymentDialog(item, 'payable')}>
                                                    Bayar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {paymentType === 'receivable' ? 'Terima Pembayaran Piutang' : 'Bayar Hutang'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedItem?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tanggal Pembayaran</Label>
                            <Input
                                type="date"
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Sumber / Tujuan Dana (Kas/Bank)</Label>
                            <Select value={paymentAccountCode} onValueChange={setPaymentAccountCode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Akun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.code} value={acc.code}>
                                            {acc.code} - {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Nominal</Label>
                            <Input
                                type="number"
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(e.target.value)}
                                max={selectedItem?.balance}
                            />
                            <p className="text-xs text-muted-foreground">
                                Sisa tagihan: {formatCurrency(selectedItem?.balance || 0)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Keterangan Tambahan</Label>
                            <Input
                                value={paymentDescription}
                                onChange={e => setPaymentDescription(e.target.value)}
                                placeholder="Contoh: Pembayaran Lunas"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Batal</Button>
                        <Button onClick={handlePaymentSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Memproses...' : 'Simpan Pembayaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

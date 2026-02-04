"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useVoucherSaleStore, VoucherSale, VoucherSaleItem } from "@/stores/voucher-sale.store"
import { useBusiness } from "@/stores/business.selectors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Loader2, Eye, Banknote } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import axios from "@/lib/axios"

// Components needed for Create Sale Form
interface Outlet { id: number, name: string }
interface Reseller { id: number, name: string, code: string }
interface VoucherProduct { id: number, name: string, price: number, stock: number }

export default function VoucherSales() {
    const { public_id } = useParams()
    const finalPublicId = Array.isArray(public_id) ? public_id[0] : public_id
    const business = useBusiness()

    // Store
    const { sales, isLoading, fetchSales, createSale, addPayment } = useVoucherSaleStore()

    // Local State for Create Dialog
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [channelType, setChannelType] = useState<"outlet" | "reseller">("outlet")
    const [selectedOutlet, setSelectedOutlet] = useState<string>("")
    const [selectedReseller, setSelectedReseller] = useState<string>("")
    const [saleItems, setSaleItems] = useState<{ productId: string, qty: number }[]>([{ productId: "", qty: 1 }])
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "partial" | "credit">("cash")
    const [paidAmount, setPaidAmount] = useState<string>("")

    // Data for dropdowns
    const [outlets, setOutlets] = useState<Outlet[]>([])
    const [resellers, setResellers] = useState<Reseller[]>([])
    const [products, setProducts] = useState<VoucherProduct[]>([])

    // Detail Dialog
    const [selectedSale, setSelectedSale] = useState<VoucherSale | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState<string>("")

    // Fetch initial data
    useEffect(() => {
        if (finalPublicId) {
            fetchSales(finalPublicId)
            fetchDropdownData()
        }
    }, [finalPublicId])

    const fetchDropdownData = async () => {
        try {
            const [outletsRes, resellersRes, productsRes] = await Promise.all([
                axios.get(`businesses/${finalPublicId}/outlets`),
                axios.get(`businesses/${finalPublicId}/resellers`),
                axios.get(`businesses/${finalPublicId}/vouchers`)
            ])

            if (outletsRes.data.success) setOutlets(outletsRes.data.data)
            if (resellersRes.data.success) setResellers(resellersRes.data.data)
            if (productsRes.data.success) setProducts(productsRes.data.data)
        } catch (error) {
            console.error("Failed to fetch dropdown data", error)
        }
    }

    // Calculations for Create Form
    const totalAmount = useMemo(() => {
        return saleItems.reduce((acc, item) => {
            const product = products.find(p => p.id.toString() === item.productId)
            return acc + (product ? product.price * item.qty : 0)
        }, 0)
    }, [saleItems, products])

    const handleAddItem = () => {
        setSaleItems([...saleItems, { productId: "", qty: 1 }])
    }

    const handleRemoveItem = (index: number) => {
        setSaleItems(saleItems.filter((_, i) => i !== index))
    }

    const handleItemChange = (index: number, field: 'productId' | 'qty', value: string | number) => {
        const newItems = [...saleItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setSaleItems(newItems)
    }

    const handleCreateSale = async () => {
        if (saleItems.some(item => !item.productId || item.qty < 1)) {
            toast.error("Mohon lengkapi data item voucher")
            return
        }

        if (channelType === 'outlet' && !selectedOutlet) {
            toast.error("Pilih outlet tujuan")
            return
        }
        if (channelType === 'reseller' && !selectedReseller) {
            toast.error("Pilih reseller tujuan")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                channel_type: channelType,
                outlet_id: channelType === 'outlet' ? parseInt(selectedOutlet) : null,
                reseller_id: channelType === 'reseller' ? parseInt(selectedReseller) : null,
                payment_method: paymentMethod,
                paid_amount: paymentMethod === 'credit' ? 0 : (paidAmount ? parseFloat(paidAmount) : totalAmount),
                items: saleItems.map(item => ({
                    voucher_product_id: parseInt(item.productId),
                    quantity: item.qty
                }))
            }

            if (!finalPublicId) return

            await createSale(finalPublicId, payload)
            toast.success("Penjualan voucher berhasil dibuat")
            setIsCreateOpen(false)
            resetForm()
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal membuat penjualan"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setSaleItems([{ productId: "", qty: 1 }])
        setPaymentMethod("cash")
        setPaidAmount("")
        setSelectedOutlet("")
        setSelectedReseller("")
    }

    const handleAddPayment = async () => {
        if (!selectedSale || !paymentAmount || !finalPublicId) return

        setIsSubmitting(true)
        try {
            await addPayment(finalPublicId, selectedSale.public_id, parseFloat(paymentAmount))
            toast.success("Pembayaran berhasil ditambahkan")
            setPaymentAmount("")
            // Refresh selected sale data
            const updated = sales.find(s => s.id === selectedSale.id)
            if (updated) setSelectedSale(updated)
            else fetchSales(finalPublicId)

            // Close detail dialog if fully paid? optional
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal menambah pembayaran"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Penjualan Voucher</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola penjualan voucher ke Outlet dan Reseller
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Penjualan Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Buat Penjualan Voucher Baru</DialogTitle>
                            <DialogDescription>Input data penjualan voucher ke outlet atau reseller</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tujuan Penjualan</Label>
                                    <Select value={channelType} onValueChange={(v: any) => setChannelType(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="outlet">Outlet</SelectItem>
                                            <SelectItem value="reseller">Reseller</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{channelType === 'outlet' ? 'Pilih Outlet' : 'Pilih Reseller'}</Label>
                                    {channelType === 'outlet' ? (
                                        <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Outlet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {outlets.map(o => (
                                                    <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Select value={selectedReseller} onValueChange={setSelectedReseller}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Reseller" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {resellers.map(r => (
                                                    <SelectItem key={r.id} value={r.id.toString()}>{r.name} ({r.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>

                            <div className="border rounded-md p-4 space-y-4">
                                <Label>Item Penjualan</Label>
                                {saleItems.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Produk Voucher</Label>
                                            <Select value={item.productId} onValueChange={(v) => handleItemChange(index, 'productId', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Produk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map(p => (
                                                        <SelectItem key={p.id} value={p.id.toString()} disabled={p.stock <= 0}>
                                                            {p.name} (Stok: {p.stock} | {formatCurrency(p.price)})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <Label className="text-xs">Qty</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={saleItems.length === 1}>
                                            X
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={handleAddItem} className="w-full">
                                    + Tambah Item
                                </Button>
                            </div>

                            <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                                <span className="font-semibold">Total Tagihan:</span>
                                <span className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Metode Pembayaran</Label>
                                    <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash (Lunas)</SelectItem>
                                            <SelectItem value="partial">Bayar Sebagian</SelectItem>
                                            <SelectItem value="credit">Piutang (Tempo)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {paymentMethod === 'partial' && (
                                    <div className="space-y-2">
                                        <Label>Jumlah Bayar Awal</Label>
                                        <Input
                                            type="number"
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(e.target.value)}
                                            placeholder="Min. 500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button onClick={handleCreateSale} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Proses Penjualan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Tujuan</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Dibayar</TableHead>
                                <TableHead>Sisa</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : sales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">Belum ada data penjualan.</TableCell>
                                </TableRow>
                            ) : (
                                sales.map((sale) => (
                                    <TableRow key={sale.public_id}>
                                        <TableCell>{format(new Date(sale.sold_at), "dd MMM yyyy HH:mm", { locale: id })}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {sale.channel_type === 'outlet' ? sale.outlet?.name : sale.reseller?.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground capitalize">{sale.channel_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(sale.total_amount)}</TableCell>
                                        <TableCell className="text-green-600">{formatCurrency(sale.paid_amount)}</TableCell>
                                        <TableCell className="text-red-500 font-medium">
                                            {sale.remaining_amount > 0 ? formatCurrency(sale.remaining_amount) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                sale.payment_status === 'paid' ? 'default' :
                                                    sale.payment_status === 'partial' ? 'secondary' : 'destructive'
                                            }>
                                                {sale.payment_status === 'paid' ? 'Lunas' :
                                                    sale.payment_status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setSelectedSale(sale)
                                                setIsDetailOpen(true)
                                            }}>
                                                <Eye className="h-4 w-4" /> Detail
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Penjualan</DialogTitle>
                        <DialogDescription>
                            ID Transaksi: {selectedSale?.public_id.split('-')[0]}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSale && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Customer:</span>
                                    <span className="font-medium">
                                        {selectedSale.channel_type === 'outlet' ? selectedSale.outlet?.name : selectedSale.reseller?.name}
                                        <Badge variant="outline" className="ml-2 text-xs">{selectedSale.channel_type}</Badge>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Dibuat Oleh:</span>
                                    <span className="font-medium">{selectedSale.sold_by?.name}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2 border-b pb-1">Item Voucher</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produk</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Harga</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSale.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.voucher_product?.name}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end space-x-8 border-t pt-4">
                                <div className="text-right">
                                    <span className="block text-muted-foreground text-sm">Total Tagihan</span>
                                    <span className="text-lg font-bold">{formatCurrency(selectedSale.total_amount)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-muted-foreground text-sm">Sudah Dibayar</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(selectedSale.paid_amount)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-muted-foreground text-sm">Sisa Tagihan</span>
                                    <span className="text-lg font-bold text-red-500">{formatCurrency(selectedSale.remaining_amount)}</span>
                                </div>
                            </div>

                            {selectedSale.remaining_amount > 0 && (
                                <div className="bg-muted p-4 rounded-md space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Banknote className="h-4 w-4" /> Tambah Pembayaran
                                    </h4>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Masukkan nominal bayar"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                        />
                                        <Button onClick={handleAddPayment} disabled={isSubmitting || !parseFloat(paymentAmount)}>
                                            {isSubmitting ? "Processing..." : "Bayar"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}

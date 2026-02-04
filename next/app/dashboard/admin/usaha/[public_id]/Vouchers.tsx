"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, Trash2 } from "lucide-react"
import { useVoucherStore, VoucherProduct } from "@/stores/voucher.store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function Vouchers() {
    const { public_id } = useParams()
    const { vouchers, isLoading, fetchVouchers, addVoucher, deleteVoucher } = useVoucherStore()

    const [isCreateProductStart, setIsCreateProductStart] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [durationValue, setDurationValue] = useState("")
    const [durationUnit, setDurationUnit] = useState("hour")
    const [sellingPrice, setSellingPrice] = useState("")
    const [ownerShare, setOwnerShare] = useState("")
    const [resellerFee, setResellerFee] = useState("")

    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchVouchers(id)
        }
    }, [public_id, fetchVouchers])

    const handleSubmitProduct = async () => {
        if (!name || !durationValue || !sellingPrice || !ownerShare || !resellerFee) {
            toast.error("Semua field wajib diisi")
            return
        }

        setIsSubmitting(true)
        try {
            const businessId = Array.isArray(public_id) ? public_id[0] : public_id
            if (!businessId) return

            await addVoucher(businessId, {
                name,
                duration_value: parseInt(durationValue),
                duration_unit: durationUnit as 'hour' | 'day' | 'month',
                selling_price: parseFloat(sellingPrice),
                owner_share: parseFloat(ownerShare),
                reseller_fee: parseFloat(resellerFee)
            })

            toast.success("Produk voucher berhasil dibuat")
            setIsCreateProductStart(false)

            // Reset form
            setName("")
            setDurationValue("")
            setDurationUnit("hour")
            setSellingPrice("")
            setOwnerShare("")
            setResellerFee("")
        } catch (error) {
            // Error handled in store
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = (item: VoucherProduct) => {
        if (item && item.public_id) {
            setDeleteId(item.public_id)
            setIsDeleteOpen(true)
        }
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        const businessId = Array.isArray(public_id) ? public_id[0] : public_id
        if (!businessId) return

        setIsSubmitting(true)
        try {
            await deleteVoucher(businessId, deleteId.toString())
            toast.success("Produk voucher berhasil dihapus")
            setIsDeleteOpen(false)
            setDeleteId(null)
        } catch (error) {
            // Error handled in store
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Produk voucher yang dihapus tidak akan tersedia lagi untuk transaksi baru.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                confirmDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manajemen Voucher</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Kelola voucher yang tersedia untuk usaha anda.
                        </p>
                    </div>
                    <Dialog open={isCreateProductStart} onOpenChange={setIsCreateProductStart}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Buat Produk Voucher
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Buat Produk Voucher Baru</DialogTitle>
                                <DialogDescription>
                                    Definisikan paket voucher baru untuk dijual.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Produk</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Paket 1 Jam"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Durasi</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            placeholder="1"
                                            value={durationValue}
                                            onChange={(e) => setDurationValue(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unit">Satuan</Label>
                                        <Select value={durationUnit} onValueChange={setDurationUnit}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih satuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hour">Jam</SelectItem>
                                                <SelectItem value="day">Hari</SelectItem>
                                                <SelectItem value="month">Bulan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Harga Jual (Rp)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="5000"
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_share">Bagian Owner (Rp)</Label>
                                        <Input
                                            id="owner_share"
                                            type="number"
                                            placeholder="3000"
                                            value={ownerShare}
                                            onChange={(e) => setOwnerShare(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reseller_fee">Komisi Reseller (Rp)</Label>
                                        <Input
                                            id="reseller_fee"
                                            type="number"
                                            placeholder="2000"
                                            value={resellerFee}
                                            onChange={(e) => setResellerFee(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateProductStart(false)} disabled={isSubmitting}>
                                    Batal
                                </Button>
                                <Button onClick={handleSubmitProduct} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan Produk"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold text-muted-foreground">Nama Produk</th>
                                        <th className="p-4 font-semibold text-muted-foreground">Durasi</th>
                                        <th className="p-4 font-semibold text-muted-foreground">Harga Jual</th>
                                        <th className="p-4 font-semibold text-muted-foreground">Komisi</th>
                                        <th className="p-4 font-semibold text-muted-foreground w-[100px]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vouchers.map((item) => (
                                        <tr key={item.public_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">{item.name}</td>
                                            <td className="p-4">
                                                {item.duration_value} {
                                                    item.duration_unit === 'hour' ? 'Jam' :
                                                        item.duration_unit === 'day' ? 'Hari' :
                                                            item.duration_unit === 'month' ? 'Bulan' : item.duration_unit
                                                }
                                            </td>
                                            <td className="p-4">Rp {item.selling_price?.toLocaleString('id-ID')}</td>
                                            <td className="p-4">Rp {item.reseller_fee?.toLocaleString('id-ID')}</td>
                                            <td className="p-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8 p-0"
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Hapus</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {vouchers.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                                Belum ada data voucher
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, Trash2, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { useVoucherStore, VoucherProduct } from "@/stores/voucher.store"
import { useAllocationStore, Allocation } from "@/stores/allocation.store"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table"
import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function Vouchers() {
    const { public_id } = useParams()
    const { vouchers, isLoading, fetchVouchers, addVoucher, deleteVoucher } = useVoucherStore()
    const { allocations, isLoading: isAllocationLoading, fetchAllocations } = useAllocationStore()

    const [isCreateProductStart, setIsCreateProductStart] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    })

    const columns: ColumnDef<Allocation>[] = useMemo(() => [
        {
            accessorKey: "allocated_to.name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Tim Finance
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.original.allocated_to?.name || '-'}</div>,
        },
        {
            accessorKey: "voucher_product.name",
            header: "Produk",
            cell: ({ row }) => <div>{row.original.voucher_product?.name || '-'}</div>,
        },
        {
            accessorKey: "qty_allocated",
            header: "Dialokasikan",
            cell: ({ row }) => <div className="text-center">{row.getValue("qty_allocated")}</div>,
        },
        {
            accessorKey: "qty_sold",
            header: "Terjual",
            cell: ({ row }) => <div className="text-center">{row.getValue("qty_sold")}</div>,
        },
        {
            accessorKey: "qty_available",
            header: "Tersedia",
            cell: ({ row }) => <div className="text-center font-bold text-orange-600">{row.getValue("qty_available")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.getValue("status") === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {row.getValue("status") === 'active' ? 'Aktif' : 'Ditutup'}
                </span>
            ),
        },
        {
            accessorKey: "allocated_at",
            header: "Tanggal",
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {new Date(row.getValue("allocated_at")).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            ),
        }
    ], [])

    const table = useReactTable({
        data: allocations,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onPaginationChange: setPagination,
    })

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
            fetchAllocations(id)
        }
    }, [public_id, fetchVouchers, fetchAllocations])

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
                        <h2 className="text-xl font-semibold tracking-tight">Daftar Voucher</h2>
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

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">Daftar Alokasi Voucher</h2>
                            <p className="text-sm text-muted-foreground">
                                Riwayat alokasi stok voucher kepada tim finance.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center py-4 gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari..."
                                    value={globalFilter ?? ""}
                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        {isAllocationLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 border-b">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <tr key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <th key={header.id} className="p-4 font-semibold text-muted-foreground">
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                            </th>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </thead>
                                        <tbody>
                                            {table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <td key={cell.id} className="p-4">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={columns.length} className="h-24 text-center">
                                                        Tidak ada hasil.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <div className="flex-1 text-sm text-muted-foreground">
                                        Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

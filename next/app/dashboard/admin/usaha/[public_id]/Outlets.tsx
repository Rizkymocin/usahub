"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import { useOutletStore, Outlet } from "@/stores/outlet.store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Loader2, MoreHorizontal, Trash2, Power, Phone, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
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
    VisibilityState,
} from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Outlets() {
    const { public_id } = useParams()
    const { outlets, isLoading, fetchOutlets, addOutlet, updateOutlet, deleteOutlet } = useOutletStore()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    })

    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchOutlets(id)
        }
    }, [public_id, fetchOutlets])

    const handleSubmit = async () => {
        if (!public_id) return
        if (!name || !email || !phone || !address) {
            toast.error("Semua field harus diisi")
            return
        }

        setIsSubmitting(true)
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            if (!id) return

            await addOutlet(id, {
                name,
                email,
                phone,
                address,
                role: 'isp_outlet'
            })
            toast.success("Outlet berhasil ditambahkan")
            setIsDialogOpen(false)
            setName("")
            setEmail("")
            setPhone("")
            setAddress("")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menambahkan outlet")
        } finally {
            setIsSubmitting(false)
        }
    }


    const handleToggleStatus = useCallback(async (outlet: Outlet) => {
        if (!public_id) return
        // We know outlet has public_id from the type, but need to ensure it matches API expectation
        // The store expects (businessId, outletPublicId, data)
        const businessId = Array.isArray(public_id) ? public_id[0] : public_id

        // Outlet type in store might not have public_id field explicitly defined in interface in Step 38 
        // Let's check Step 38. Outlet interface: id, business_id, name... created_at. 
        // Wait, Step 38 Outlet interface DOES NOT HAVE public_id. 
        // However, the store methods use `outletPublicId`. 
        // The API returns `data` which has `public_id`.
        // I should update the Outlet interface in store if I can, or cast it here.
        // For now, I will assume the object passed has public_id (as it comes from API).
        const outletPublicId = (outlet as any).public_id; // Cast to any to access public_id until interface is updated

        try {
            await updateOutlet(businessId, outletPublicId, { status: !outlet.status })
            toast.success(outlet.status ? "Outlet dinonaktifkan" : "Outlet diaktifkan")
        } catch (error) {
            toast.error("Gagal mengubah status outlet")
        }
    }, [public_id, updateOutlet])

    const handleDelete = useCallback(async (outlet: Outlet) => {
        if (!confirm("Apakah anda yakin ingin menghapus data outlet ini?")) return
        if (!public_id) return
        const businessId = Array.isArray(public_id) ? public_id[0] : public_id
        const outletPublicId = (outlet as any).public_id;

        try {
            await deleteOutlet(businessId, outletPublicId)
            toast.success("Outlet berhasil dihapus")
        } catch (error) {
            toast.error("Gagal menghapus outlet")
        }
    }, [public_id, deleteOutlet])

    const columns: ColumnDef<Outlet>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: "Nama",
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "phone",
            header: "Telepon",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "address",
            header: "Alamat",
            cell: ({ row }) => <div className="text-muted-foreground max-w-[200px] truncate">{row.getValue("address")}</div>,
        },
        {
            accessorKey: "current_balance",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Saldo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-mono">Rp {Number(row.getValue("current_balance")).toLocaleString()}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")
                return (
                    <Badge variant={status ? "default" : "destructive"}>
                        {status ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                )
            },
            filterFn: (row, id, value) => {
                if (value === "all") return true
                return value === "active" ? !!row.getValue(id) : !row.getValue(id)
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item)} className="cursor-pointer">
                                <Power className="mr-2 h-4 w-4" />
                                {item.status ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(item)} className="cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Outlet
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [handleToggleStatus, handleDelete])

    const table = useReactTable({
        data: outlets,
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center justify-between w-full">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Daftar Outlet</h2>
                        <p className="text-sm text-muted-foreground">
                            Kelola outlet yang terdaftar pada usaha anda.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Outlet
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Outlet Baru</DialogTitle>
                                <DialogDescription>
                                    Masukkan detail outlet baru untuk mulai mengelola transaksi.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Outlet</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Outlet Sudirman"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Outlet</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Contoh: outlet@bisnis.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Email ini akan digunakan untuk login aplikasi outlet.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telepon</Label>
                                        <Input
                                            id="phone"
                                            placeholder="0812..."
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat</Label>
                                        <Input
                                            id="address"
                                            placeholder="Jl. Merdeka No. 1"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                                    <p className="font-medium text-foreground mb-1">Informasi Login:</p>
                                    <p>Password default untuk outlet baru adalah <strong>outlet123</strong>. Pastikan untuk segera mengganti password setelah login pertama kali.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                                    Batal
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center py-4 gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari outlet..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select
                        value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                        onValueChange={(value) => table.getColumn("status")?.setFilterValue(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isLoading && outlets.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
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
                )}
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
            </CardContent>
        </Card>
    )
}

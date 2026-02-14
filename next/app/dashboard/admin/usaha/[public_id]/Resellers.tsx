"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, MoreHorizontal, Trash2, Power, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowLeftRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
} from "@tanstack/react-table"
import { useResellerStore, Reseller } from "@/stores/reseller.store"
import { useOutletStore } from "@/stores/outlet.store"

export default function Resellers() {
    const { public_id } = useParams()

    // Store Hooks
    const {
        resellers,
        activeResellers,
        isLoading: isResellersLoading,
        fetchResellers,
        fetchActiveResellers,
        addReseller,
        updateReseller,
        deleteReseller
    } = useResellerStore()
    const { outlets, fetchOutlets } = useOutletStore()


    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSwitchOutletOpen, setIsSwitchOutletOpen] = useState(false)
    const [resellerToSwitch, setResellerToSwitch] = useState<Reseller | null>(null)
    const [switchOutletId, setSwitchOutletId] = useState("")

    // Form State
    const [name, setName] = useState("")
    const [selectedOutlet, setSelectedOutlet] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Table State for Active Tab
    const [activeSorting, setActiveSorting] = useState<SortingState>([])
    const [activeColumnFilters, setActiveColumnFilters] = useState<ColumnFiltersState>([])
    const [activeGlobalFilter, setActiveGlobalFilter] = useState("")
    const [activePagination, setActivePagination] = useState({ pageIndex: 0, pageSize: 5 })



    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchActiveResellers(id)
            fetchOutlets(id)
        }
    }, [public_id, fetchActiveResellers, fetchOutlets])

    const handleSubmit = async () => {
        if (!selectedOutlet) {
            toast.error("Pilih outlet terlebih dahulu")
            return
        }
        if (!name || !phone) {
            toast.error("Nama dan Telepon wajib diisi")
            return
        }
        setIsSubmitting(true)
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            if (!id) return
            await addReseller(id, {
                outlet_public_id: selectedOutlet,
                name,
                phone,
                address
            })
            toast.success("Reseller berhasil ditambahkan. Menunggu instalasi.")
            setIsDialogOpen(false)
            // Reset form
            setName("")
            setPhone("")
            setAddress("")
            setSelectedOutlet("")
            // Refresh inactive resellers
            // fetchInactiveResellers(id)
        } catch (error: any) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }



    const handleToggleStatus = async (reseller: Reseller) => {
        if (!public_id) return
        const businessId = Array.isArray(public_id) ? public_id[0] : public_id

        try {
            await updateReseller(businessId, reseller.code, {
                is_active: !reseller.is_active
            })
            toast.success(reseller.is_active ? "Reseller dinonaktifkan" : "Reseller diaktifkan")
            // Refresh both lists
            fetchActiveResellers(businessId)
        } catch (error: any) {
            // Error handled
        }
    }

    const handleDelete = async (reseller: Reseller) => {
        if (!confirm("Apakah anda yakin ingin menghapus data reseller ini?")) return

        if (!public_id) return
        const businessId = Array.isArray(public_id) ? public_id[0] : public_id

        try {
            await deleteReseller(businessId, reseller.code)
            toast.success("Reseller berhasil dihapus")
            // Refresh appropriate list
            if (reseller.is_active) {
                fetchActiveResellers(businessId)
            }
        } catch (error: any) {
            // Error handled
        }
    }

    const handleSwitchOutletSubmit = async () => {
        if (!resellerToSwitch || !switchOutletId) {
            toast.error("Pilih outlet tujuan terlebih dahulu")
            return
        }

        if (!public_id) return
        const businessId = Array.isArray(public_id) ? public_id[0] : public_id

        setIsSubmitting(true)
        try {
            await updateReseller(businessId, resellerToSwitch.code, {
                outlet_public_id: switchOutletId
            })
            toast.success("Outlet berhasil dipindah")
            setIsSwitchOutletOpen(false)
            setResellerToSwitch(null)
            setSwitchOutletId("")
            // Refresh appropriate list
            if (resellerToSwitch.is_active) {
                fetchActiveResellers(businessId)
            }
        } catch (error: any) {
            // Error handled by store/toast
        } finally {
            setIsSubmitting(false)
        }
    }

    // Columns for Active Resellers
    const activeColumns: ColumnDef<Reseller>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Nama
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "code",
            header: "Kode",
            cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("code")}</div>,
        },
        {
            accessorKey: "outlet.name",
            header: "Outlet",
            cell: ({ row }) => <div>{row.original.outlet?.name || "-"}</div>,
        },
        {
            accessorKey: "phone",
            header: "Telepon",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone")}</div>,
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
                                Nonaktifkan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                setResellerToSwitch(item)
                                setSwitchOutletId("")
                                setIsSwitchOutletOpen(true)
                            }} className="cursor-pointer">
                                <ArrowLeftRight className="mr-2 h-4 w-4" />
                                Pindah Outlet
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item)} className="cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Reseller
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [])

    const activeTable = useReactTable({
        data: activeResellers,
        columns: activeColumns,
        onSortingChange: setActiveSorting,
        onColumnFiltersChange: setActiveColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setActiveGlobalFilter,
        state: {
            sorting: activeSorting,
            columnFilters: activeColumnFilters,
            globalFilter: activeGlobalFilter,
            pagination: activePagination,
        },
        onPaginationChange: setActivePagination,
    })



    const renderTable = (table: any, columns: ColumnDef<Reseller>[], globalFilter: string, setGlobalFilter: (value: string) => void) => (
        <>
            <div className="flex items-center py-4 gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari reseller..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {isResellersLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                            {table.getHeaderGroups().map((headerGroup: any) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header: any) => {
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
                                table.getRowModel().rows.map((row: any) => (
                                    <tr
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell: any) => (
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
        </>
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center justify-between w-full">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Daftar Reseller</h2>
                        <p className="text-sm text-muted-foreground">
                            Kelola reseller yang terdaftar pada usaha anda.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Reseller
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Reseller Baru</DialogTitle>
                                <DialogDescription>
                                    Masukkan detail reseller baru untuk mulai mengelola transaksi.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="outlet">Outlet</Label>
                                    <Select
                                        value={selectedOutlet}
                                        onValueChange={setSelectedOutlet}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Outlet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {outlets.map((outlet) => (
                                                <SelectItem key={outlet.public_id} value={outlet.public_id}>
                                                    {outlet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Reseller</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Reseller A"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
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

                    <Dialog open={isSwitchOutletOpen} onOpenChange={setIsSwitchOutletOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Pindah Outlet</DialogTitle>
                                <DialogDescription>
                                    Pindahkan reseller <b>{resellerToSwitch?.name}</b> ke outlet lain.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="switch-outlet">Outlet Tujuan</Label>
                                    <Select
                                        value={switchOutletId}
                                        onValueChange={setSwitchOutletId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Outlet Tujuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {outlets.map((outlet) => (
                                                <SelectItem key={outlet.public_id} value={outlet.public_id}>
                                                    {outlet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsSwitchOutletOpen(false)} disabled={isSubmitting}>
                                    Batal
                                </Button>
                                <Button onClick={handleSwitchOutletSubmit} disabled={isSubmitting}>
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
                {renderTable(activeTable, activeColumns, activeGlobalFilter, setActiveGlobalFilter)}
            </CardContent>
        </Card>
    )
}

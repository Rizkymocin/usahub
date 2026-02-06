"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { useAllocationStore, Allocation } from "@/stores/allocation.store"
import { Input } from "@/components/ui/input"
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

export default function VoucherAllocations() {
    const { public_id } = useParams()
    const { allocations, isLoading, fetchAllocations } = useAllocationStore()

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchAllocations(id)
        }
    }, [public_id, fetchAllocations])

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

    return (
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

                {isLoading ? (
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
                                <tbody className='divide-y'>
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
    )
}

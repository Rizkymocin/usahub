"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { useStockRequestStore, StockRequest } from "@/stores/stock-request.store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Eye } from "lucide-react"
import { RefreshButton } from "@/components/ui/refresh-button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export default function Stock() {
    const { public_id } = useParams()
    const { requests, isLoading, fetchRequests, approveRequest, rejectRequest } = useStockRequestStore()

    // State for actions
    const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null)
    const [isApproveOpen, setIsApproveOpen] = useState(false)
    const [isRejectOpen, setIsRejectOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [note, setNote] = useState("")

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
            fetchRequests(id)
        }
    }, [public_id, fetchRequests])

    const reloadTable = () => {
        if (!public_id) return
        const id = Array.isArray(public_id) ? public_id[0] : public_id
        return fetchRequests(id, undefined, true) // Force refresh
    }

    const handleApprove = async () => {
        if (!selectedRequest || !public_id) return

        setIsSubmitting(true)
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            await approveRequest(id, selectedRequest.id, note)
            toast.success("Permintaan stok berhasil disetujui")
            setIsApproveOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyetujui permintaan")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReject = async () => {
        if (!selectedRequest || !public_id) return

        setIsSubmitting(true)
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            await rejectRequest(id, selectedRequest.id, note)
            toast.success("Permintaan stok berhasil ditolak")
            setIsRejectOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menolak permintaan")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setNote("")
        setSelectedRequest(null)
    }

    const columns: ColumnDef<StockRequest>[] = useMemo(() => [
        {
            accessorKey: "requested_at",
            header: "Tanggal",
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {format(new Date(row.getValue("requested_at")), "dd MMM yyyy HH:mm", { locale: idLocale })}
                </div>
            ),
        },
        {
            accessorKey: "requested_by.name",
            header: "Direquest Oleh",
            cell: ({ row }) => <div className="font-medium">{row.original.requested_by?.name || '-'}</div>,
        },
        {
            accessorKey: "outlet.name",
            header: "Outlet Tujuan",
            cell: ({ row }) => <div className="font-medium">{row.original.outlet?.name || '-'}</div>,
        },
        {
            accessorKey: "total_amount",
            header: "Total",
            cell: ({ row }) => <div className="font-mono font-medium">Rp {Number(row.getValue("total_amount")).toLocaleString('id-ID')}</div>,
        },
        {
            id: "products",
            header: "Item Voucher",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    {row.original.items.map((item) => (
                        <div key={item.id} className="text-xs">
                            <span className="font-medium">{item.voucher_product?.name}</span>
                            <span className="text-muted-foreground ml-1">x{item.qty}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={
                        status === 'approved' ? 'default' :
                            status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                        {status === 'approved' ? 'Disetujui' :
                            status === 'rejected' ? 'Ditolak' : 'Pending'}
                    </Badge>
                )
            },
            filterFn: (row, id, value) => {
                return value === "all" ? true : row.getValue(id) === value
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const request = row.original

                return (
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedRequest(request)
                            setIsDetailOpen(true)
                        }}>
                            <Eye className="h-4 w-4" />
                        </Button>

                        {request.status === 'pending' && (
                            <>
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => {
                                    setSelectedRequest(request)
                                    setIsApproveOpen(true)
                                }}>
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                                    setSelectedRequest(request)
                                    setIsRejectOpen(true)
                                }}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                )
            },
        },
    ], [])

    const table = useReactTable({
        data: requests,
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Permintaan Stok Voucher</h2>
                        <p className="text-sm text-muted-foreground">
                            Kelola permintaan stok voucher dari staff Finance/Outlet.
                        </p>
                    </div>
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
                    <Select
                        value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                        onValueChange={(value) => table.getColumn("status")?.setFilterValue(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Disetujui</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
                    <RefreshButton onRefresh={reloadTable} />
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="p-4 font-semibold text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows?.length ? (
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
                                        Tidak ada data permintaan stok.
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

                {/* Approve Dialog */}
                <Dialog open={isApproveOpen} onOpenChange={(open) => {
                    setIsApproveOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Setujui Permintaan</DialogTitle>
                            <DialogDescription>
                                Setujui permintaan stok ini? Sistem akan mencatat persetujuan ini.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Catatan (Opsional)</Label>
                                <Textarea
                                    placeholder="Catatan tambahan..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={isSubmitting}>Batal</Button>
                            <Button onClick={handleApprove} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Setujui
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={isRejectOpen} onOpenChange={(open) => {
                    setIsRejectOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tolak Permintaan</DialogTitle>
                            <DialogDescription>
                                Apakah anda yakin ingin menolak permintaan stok ini?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Alasan Penolakan (Opsional)</Label>
                                <Textarea
                                    placeholder="Contoh: Stok sedang kosong"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isSubmitting}>Batal</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tolak
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detail Permintaan Stok</DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-2 border-b pb-4">
                                    <div className="text-muted-foreground">Direquest Oleh</div>
                                    <div className="font-medium text-right">{selectedRequest.requested_by.name}</div>

                                    <div className="text-muted-foreground">Outlet</div>
                                    <div className="font-medium text-right">{selectedRequest.outlet?.name || '-'}</div>

                                    <div className="text-muted-foreground">Tanggal</div>
                                    <div className="font-medium text-right">{format(new Date(selectedRequest.requested_at), "dd MMM yyyy HH:mm", { locale: idLocale })}</div>

                                    <div className="text-muted-foreground">Status</div>
                                    <div className="text-right">
                                        <Badge variant={selectedRequest.status === 'approved' ? 'default' : selectedRequest.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {selectedRequest.status}
                                        </Badge>
                                    </div>

                                    {selectedRequest.request_note && (
                                        <>
                                            <div className="text-muted-foreground">Catatan Request</div>
                                            <div className="font-medium text-right col-span-2 italic bg-muted/20 p-2 rounded mt-1">{selectedRequest.request_note}</div>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <div className="font-medium mb-2">Item Voucher</div>
                                    <div className="space-y-2">
                                        {selectedRequest.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center bg-muted/30 p-2 rounded">
                                                <div>
                                                    <div className="font-medium">{item.voucher_product.name}</div>
                                                    <div className="text-muted-foreground text-xs">{item.qty} x Rp {item.unit_price.toLocaleString('id-ID')}</div>
                                                </div>
                                                <div className="font-mono">
                                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-4 flex justify-between items-center">
                                    <div className="font-bold">Total Request</div>
                                    <div className="font-mono font-bold text-lg">Rp {selectedRequest.total_amount.toLocaleString('id-ID')}</div>
                                </div>

                                {selectedRequest.status === 'approved' && (
                                    <div className="bg-green-50 text-green-800 p-3 rounded text-xs mt-4">
                                        Disetujui pada {selectedRequest.processed_at && format(new Date(selectedRequest.processed_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                                        {selectedRequest.process_note && <div className="mt-1 italic">Note: {selectedRequest.process_note}</div>}
                                    </div>
                                )}
                                {selectedRequest.status === 'rejected' && (
                                    <div className="bg-red-50 text-red-800 p-3 rounded text-xs mt-4">
                                        Ditolak pada {selectedRequest.processed_at && format(new Date(selectedRequest.processed_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                                        {selectedRequest.process_note && <div className="mt-1 italic">Alasan: {selectedRequest.process_note}</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </CardContent>
        </Card>
    )
}

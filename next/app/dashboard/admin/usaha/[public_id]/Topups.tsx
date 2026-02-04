"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { useTopupStore, TopupRequest } from "@/stores/topup.store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Eye } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
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

export default function Topups() {
    const { public_id } = useParams()
    const { requests, isLoading, fetchRequests, approveRequest, rejectRequest } = useTopupStore()

    // State for actions
    const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(null)
    const [isApproveOpen, setIsApproveOpen] = useState(false)
    const [isRejectOpen, setIsRejectOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [paymentMethod, setPaymentMethod] = useState("transfer")
    const [referenceNo, setReferenceNo] = useState("")
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

    const handleApprove = async () => {
        if (!selectedRequest || !public_id) return

        setIsSubmitting(true)
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            await approveRequest(id, selectedRequest.id, {
                payment_method: paymentMethod,
                reference_no: referenceNo,
                note: note
            })
            toast.success("Topup berhasil disetujui")
            setIsApproveOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyetujui topup")
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
            toast.success("Topup berhasil ditolak")
            setIsRejectOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menolak topup")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setPaymentMethod("transfer")
        setReferenceNo("")
        setNote("")
        setSelectedRequest(null)
    }

    const columns: ColumnDef<TopupRequest>[] = useMemo(() => [
        {
            accessorKey: "requested_at",
            header: "Tanggal Request",
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {format(new Date(row.getValue("requested_at")), "dd MMM yyyy HH:mm", { locale: idLocale })}
                </div>
            ),
        },
        {
            accessorKey: "outlet.name",
            header: "Outlet",
            cell: ({ row }) => <div className="font-medium">{row.original.outlet.name}</div>,
        },
        {
            accessorKey: "requested_amount",
            header: "Jumlah",
            cell: ({ row }) => <div className="font-mono font-medium">Rp {Number(row.getValue("requested_amount")).toLocaleString('id-ID')}</div>,
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
                            status === 'rejected' ? 'Ditolak' : 'Menunggu'}
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

                        {request.status === 'requested' && (
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
                        <CardTitle>Request Topup Outlet</CardTitle>
                        <CardDescription>Kelola permintaan topup saldo dari outlet.</CardDescription>
                    </div>
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
                            <SelectItem value="requested">Menunggu</SelectItem>
                            <SelectItem value="approved">Disetujui</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
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
                                        Tidak ada data request topup.
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
                            <DialogTitle>Setujui Topup</DialogTitle>
                            <DialogDescription>
                                Konfirmasi pembayaran dan setujui permintaan topup dari <strong>{selectedRequest?.outlet.name}</strong> senilai <strong>Rp {selectedRequest?.requested_amount.toLocaleString('id-ID')}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Metode Pembayaran</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                                        <SelectItem value="cash">Tunai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Nomor Referensi (Opsional)</Label>
                                <Input
                                    placeholder="Contoh: TRX-123456"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                />
                            </div>
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
                            <DialogTitle>Tolak Topup</DialogTitle>
                            <DialogDescription>
                                Apakah anda yakin ingin menolak permintaan topup ini?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Alasan Penolakan (Opsional)</Label>
                                <Textarea
                                    placeholder="Contoh: Bukti transfer tidak valid"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isSubmitting}>Batal</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tolak Permanen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detail Request Topup</DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-2 border-b pb-4">
                                    <div className="text-muted-foreground">Outlet</div>
                                    <div className="font-medium text-right">{selectedRequest.outlet.name}</div>

                                    <div className="text-muted-foreground">Tanggal</div>
                                    <div className="font-medium text-right">{format(new Date(selectedRequest.requested_at), "dd MMM yyyy HH:mm", { locale: idLocale })}</div>

                                    <div className="text-muted-foreground">Status</div>
                                    <div className="text-right">
                                        <Badge variant={selectedRequest.status === 'approved' ? 'default' : selectedRequest.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {selectedRequest.status}
                                        </Badge>
                                    </div>
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
                                    <div className="font-mono font-bold text-lg">Rp {selectedRequest.requested_amount.toLocaleString('id-ID')}</div>
                                </div>

                                {selectedRequest.status === 'approved' && (
                                    <div className="bg-green-50 text-green-800 p-3 rounded text-xs mt-4">
                                        Disetujui pada {selectedRequest.approved_at && format(new Date(selectedRequest.approved_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                                        {selectedRequest.rejection_note && <div className="mt-1 italic">Note: {selectedRequest.rejection_note}</div>}
                                    </div>
                                )}
                                {selectedRequest.status === 'rejected' && (
                                    <div className="bg-red-50 text-red-800 p-3 rounded text-xs mt-4">
                                        Ditolak pada {selectedRequest.rejected_at && format(new Date(selectedRequest.rejected_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                                        {selectedRequest.rejection_note && <div className="mt-1 italic">Alasan: {selectedRequest.rejection_note}</div>}
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

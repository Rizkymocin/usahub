"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useVoucherSaleStore, VoucherSale } from "@/stores/voucher-sale.store"
import { useBusiness } from "@/stores/business.selectors"
import { useBusinessActions } from "@/stores/business.selectors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Search, Filter, Calendar as CalendarIcon, ArrowLeft, RefreshCw, Download } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function Penjualan() {
    const { public_id } = useParams()
    const router = useRouter()
    const finalPublicId = Array.isArray(public_id) ? public_id[0] : public_id
    const business = useBusiness()
    const { fetchBusiness } = useBusinessActions()

    // Store
    const { sales, isLoading: isSalesLoading, fetchSales, error: salesError } = useVoucherSaleStore()

    // Local State
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
        from: undefined,
        to: undefined
    })

    // Initial Fetch
    useEffect(() => {
        if (finalPublicId) {
            if (!business) {
                fetchBusiness(finalPublicId)
            }
            // Only fetch voucher sales if business category is ISP
            // We might need to wait for business to load to know the category, 
            // but for now we can fetch if we suspect it's ISP or just fetch anyway if the API allows.
            // However, the requirement says "if the business category is 'isp', then get the data from voucher sales"
            // So we should probably wait or check business category.
            // But since this page is likely linked from a context where we know it's ISP, or the user navigated here.
            // Let's safe guard:
        }
    }, [finalPublicId, business, fetchBusiness])

    useEffect(() => {
        if (finalPublicId && business?.category === 'isp') {
            fetchSales(finalPublicId)
        }
    }, [finalPublicId, business, fetchSales])


    // Filter Logic
    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            // Text Search
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                sale.public_id.toLowerCase().includes(searchLower) ||
                sale.customer_name?.toLowerCase().includes(searchLower) ||
                (sale.channel_type === 'outlet' && sale.outlet?.name.toLowerCase().includes(searchLower)) ||
                (sale.channel_type === 'reseller' && sale.reseller?.name.toLowerCase().includes(searchLower)) ||
                (sale.items.some(item => item.voucher_product?.name.toLowerCase().includes(searchLower)))

            // Status Filter
            let matchesStatus = true
            if (statusFilter !== 'all') {
                if (statusFilter === 'reserved') matchesStatus = sale.status === 'reserved'
                else if (statusFilter === 'completed') matchesStatus = sale.status === 'completed'
                else if (statusFilter === 'debt') matchesStatus = sale.status === 'partial_debt' || sale.status === 'full_debt'
                else if (statusFilter === 'paid') matchesStatus = sale.payment_status === 'paid' // Legacy support if needed, or mapped
            }

            // Date Range Filter
            let matchesDate = true
            if (dateRange.from && dateRange.to) {
                const saleDate = new Date(sale.sold_at)
                // Reset times for accurate date comparison
                const from = new Date(dateRange.from)
                from.setHours(0, 0, 0, 0)
                const to = new Date(dateRange.to)
                to.setHours(23, 59, 59, 999)
                matchesDate = saleDate >= from && saleDate <= to
            }

            return matchesSearch && matchesStatus && matchesDate
        })
    }, [sales, searchTerm, statusFilter, dateRange])

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter, dateRange])

    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE)
    const paginatedSales = filteredSales.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)
    }

    const getStatusBadge = (sale: VoucherSale) => {
        if (sale.status === 'reserved') return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Reserved</Badge>
        if (sale.status === 'completed') return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Selesai</Badge>
        if (sale.status === 'partial_debt') return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Sebagian</Badge>
        if (sale.status === 'full_debt') return <Badge variant="destructive">Belum Lunas</Badge>
        return <Badge variant="outline">{sale.status}</Badge>
    }

    const handleRefresh = () => {
        if (finalPublicId && business?.category === 'isp') {
            fetchSales(finalPublicId)
            toast.success("Data diperbarui")
        }
    }

    if (!business) {
        return <div className="p-6">Loading business data...</div>
    }

    if (business.category !== 'isp') {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center text-center py-10">
                            <h2 className="text-xl font-semibold text-muted-foreground">Fitur tidak tersedia for kategori bisnis ini.</h2>
                            <p className="text-sm text-muted-foreground mt-2">Halaman ini khusus untuk bisnis kategori ISP.</p>
                            <Button className="mt-4" onClick={() => router.back()}>Kembali</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Riwayat Penjualan</h1>
                        <p className="text-muted-foreground">
                            Daftar semua transaksi penjualan voucher
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", isSalesLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    {/* Add Export functionality here if needed */}
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari ID, Pelanggan, atau Produk..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="completed">Selesai (Lunas)</SelectItem>
                                    <SelectItem value="reserved">Reserved (Prepaid)</SelectItem>
                                    <SelectItem value="debt">Belum Lunas / Hutang</SelectItem>
                                </SelectContent>
                            </Select>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd/MM/y")} - {format(dateRange.to, "dd/MM/y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd/MM/y")
                                            )
                                        ) : (
                                            <span>Pilih Tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="range"
                                        selected={{ from: dateRange.from, to: dateRange.to || undefined }}
                                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {(searchTerm || statusFilter !== 'all' || dateRange.from) && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setStatusFilter("all")
                                        setDateRange({ from: undefined, to: undefined })
                                    }}
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Waktu Transaksi</TableHead>
                                <TableHead className="w-[150px]">ID Transaksi</TableHead>
                                <TableHead>Pelanggan / Channel</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Terbayar</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isSalesLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Loading data...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredSales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        Tidak ada data penjualan yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSales.map((sale) => (
                                    <TableRow key={sale.id} className="cursor-default hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            {format(new Date(sale.sold_at), "dd MMM yyyy", { locale: id })}
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(sale.sold_at), "HH:mm")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs">{sale.public_id.split('-')[0]}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {sale.channel_type === 'outlet' ? sale.outlet?.name :
                                                        sale.channel_type === 'reseller' ? sale.reseller?.name :
                                                            sale.customer_name || 'Umum'}
                                                </span>
                                                <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                                    {sale.channel_type}
                                                    {sale.channel_type === 'reseller' && sale.reseller?.code && ` (${sale.reseller.code})`}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {sale.items.map((item, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <span className="font-medium">{item.quantity}x</span> {item.voucher_product?.name || 'Unknown Product'}
                                                    </div>
                                                ))}
                                                {sale.items.length > 2 && (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        +{sale.items.length - 2} item lainnya
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(sale.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={cn(
                                                sale.paid_amount >= sale.total_amount ? "text-green-600" : "text-amber-600"
                                            )}>
                                                {formatCurrency(sale.paid_amount)}
                                            </span>
                                            {sale.remaining_amount > 0 && (
                                                <div className="text-xs text-red-500">
                                                    Sisa: {formatCurrency(sale.remaining_amount)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(sale)}
                                            {sale.is_prepaid && (
                                                <div className="mt-1">
                                                    {sale.delivered_at ? (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 border-green-200 text-green-700">Terkirim</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-200 text-amber-700">Belum Kirim</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <div className="flex items-center justify-end space-x-2 p-4 pt-0">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredSales.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSales.length)} of {filteredSales.length} entries
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
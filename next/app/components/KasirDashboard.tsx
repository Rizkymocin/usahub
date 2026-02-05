"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { useBusiness } from "@/stores/business.selectors"
import { useVoucherStockStore } from "@/stores/voucher-stock.store"
import { useVoucherSaleStore } from "@/stores/voucher-sale.store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    ShoppingCart,
    Package,
    TrendingUp,
    History,
    Search,
    Plus,
    Minus,
    CheckCircle2,
    Store
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "sonner"
import { RefreshButton } from "@/components/ui/refresh-button"

export default function KasirDashboard() {
    const { public_id } = useParams()
    const business = useBusiness()
    const { summary: fetchedStockSummary, fetchSummary, isLoading: isStockLoading } = useVoucherStockStore()
    const { sales: fetchedSales, fetchSales, isLoading: isSalesLoading, createSale } = useVoucherSaleStore()

    const stockSummary = useMemo(() => {
        if (!isStockLoading && fetchedStockSummary.length === 0) {
            // Return dummy data if empty
            return [
                {
                    voucher_product_id: 1,
                    total_quantity: 50,
                    total_value: 500000,
                    voucher_product: { id: 1, name: "Voucher 1 Jam", selling_price: 5000, duration_value: 1, duration_unit: 'hour', is_active: true }
                },
                {
                    voucher_product_id: 2,
                    total_quantity: 20,
                    total_value: 400000,
                    voucher_product: { id: 2, name: "Voucher 3 Jam", selling_price: 15000, duration_value: 3, duration_unit: 'hour', is_active: true }
                },
                {
                    voucher_product_id: 3,
                    total_quantity: 15,
                    total_value: 750000,
                    voucher_product: { id: 3, name: "Voucher 24 Jam", selling_price: 50000, duration_value: 24, duration_unit: 'hour', is_active: true }
                }
            ] as any[]
        }
        return fetchedStockSummary
    }, [fetchedStockSummary, isStockLoading])

    const sales = useMemo(() => {
        if (!isSalesLoading && fetchedSales.length === 0) {
            // Return dummy data if empty
            return [
                {
                    id: 1,
                    public_id: "SALE-0001",
                    total_amount: 25000,
                    sold_at: new Date().toISOString(),
                    status: "success",
                    payment_method: "cash"
                },
                {
                    id: 2,
                    public_id: "SALE-0002",
                    total_amount: 50000,
                    sold_at: new Date(Date.now() - 3600000).toISOString(),
                    status: "success",
                    payment_method: "cash"
                }
            ] as any[]
        }
        return fetchedSales
    }, [fetchedSales, isSalesLoading])

    const [searchTerm, setSearchTerm] = useState("")
    const [cart, setCart] = useState<Record<number, number>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const businessId = Array.isArray(public_id) ? public_id[0] : public_id

    useEffect(() => {
        if (businessId) {
            fetchSummary(businessId as string)
            fetchSales(businessId as string)
        }
    }, [businessId, fetchSummary, fetchSales])

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        const todaySales = sales.filter(s => s.sold_at.startsWith(today))
        const totalAmount = todaySales.reduce((acc, curr) => acc + Number(curr.total_amount), 0)
        const totalVouchers = stockSummary.reduce((acc, curr) => acc + curr.total_quantity, 0)

        return {
            todaySalesCount: todaySales.length,
            todayTotalAmount: totalAmount,
            totalStock: totalVouchers
        }
    }, [sales, stockSummary])

    const filteredVouchers = useMemo(() => {
        return stockSummary.filter(s =>
            (s.voucher_product?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [stockSummary, searchTerm])

    const updateCart = (productId: number, delta: number) => {
        setCart(prev => {
            const current = prev[productId] || 0
            const next = current + delta
            if (next <= 0) {
                const { [productId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [productId]: next }
        })
    }

    const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0)
    const totalCartPrice = Object.entries(cart).reduce((acc, [id, qty]) => {
        const item = stockSummary.find(s => s.voucher_product_id === Number(id))
        const price = item?.voucher_product?.selling_price || item?.voucher_product?.price || 0
        return acc + price * qty
    }, 0)

    const handleProcessSale = async () => {
        if (Object.keys(cart).length === 0 || !businessId) return

        setIsSubmitting(true)
        try {
            const items = Object.entries(cart).map(([id, qty]) => {
                const stockItem = stockSummary.find(s => s.voucher_product_id === Number(id))
                return {
                    voucher_product_id: Number(id),
                    quantity: qty,
                    unit_price: stockItem?.voucher_product?.selling_price || stockItem?.voucher_product?.price || 0
                }
            })

            await createSale(businessId as string, {
                items,
                payment_method: 'cash', // Default to cash for quick sale
                paid_amount: totalCartPrice,
                channel_type: 'outlet' // Default
            })

            toast.success("Transaksi berhasil!")
            setCart({})
            fetchSummary(businessId as string)
        } catch (error: any) {
            toast.error(error?.message || "Gagal memproses transaksi")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRefresh = async () => {
        if (businessId) {
            await Promise.all([
                fetchSummary(businessId as string),
                fetchSales(businessId as string)
            ])
        }
    }

    return (
        <div className="p-6 space-y-8 bg-zinc-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kasir Dashboard</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Store className="h-4 w-4" />
                        {business?.name || "Memuat..."} • {format(new Date(), "EEEE, dd MMMM yyyy", { locale: idLocale })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshButton onRefresh={handleRefresh} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
                        <TrendingUp className="h-4 w-4 text-white/70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {stats.todayTotalAmount.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-indigo-100 mt-1">{stats.todaySalesCount} transaksi sukses</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Stok Voucher</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStock} Pcs</div>
                        <p className="text-xs text-muted-foreground mt-1">Total dari {stockSummary.length} produk</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Target Penjualan</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">75%</div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full mt-2">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Main Content: Voucher List */}
                <Card className="lg:col-span-4 shadow-sm h-fit">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Voucher Ready</CardTitle>
                                <CardDescription>Pilih voucher untuk transaksi cepat</CardDescription>
                            </div>
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari voucher..."
                                    className="pl-8 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isStockLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredVouchers.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filteredVouchers.map((item) => (
                                    <div
                                        key={item.voucher_product_id}
                                        className="flex items-center justify-between p-4 rounded-xl border bg-white hover:border-indigo-200 hover:bg-indigo-50/10 transition-all group"
                                    >
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">
                                                {item.voucher_product?.name}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                                    Stok: {item.total_quantity}
                                                </Badge>
                                                <span className="text-xs font-medium text-zinc-600">
                                                    Rp {(item.voucher_product?.selling_price || item.voucher_product?.price || 0).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {cart[item.voucher_product_id] ? (
                                                <div className="flex items-center bg-zinc-100 rounded-lg p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-md hover:bg-white"
                                                        onClick={() => updateCart(item.voucher_product_id, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-xs font-bold">
                                                        {cart[item.voucher_product_id]}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-md hover:bg-white"
                                                        disabled={cart[item.voucher_product_id] >= item.total_quantity}
                                                        onClick={() => updateCart(item.voucher_product_id, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                                                    disabled={item.total_quantity === 0}
                                                    onClick={() => updateCart(item.voucher_product_id, 1)}
                                                >
                                                    Tambah
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                Tidak ada voucher yang ditemukan
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Cart & History */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Cart Section */}
                    <Card className="border-indigo-100 shadow-md">
                        <CardHeader className="bg-indigo-50/50 rounded-t-xl">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 mt-0.5 text-indigo-600" />
                                Ringkasan Belanja
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {totalCartItems > 0 ? (
                                <div className="space-y-4">
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                        {Object.entries(cart).map(([id, qty]) => {
                                            const item = stockSummary.find(s => s.voucher_product_id === Number(id))
                                            const itemPrice = item?.voucher_product?.selling_price || item?.voucher_product?.price || 0
                                            return (
                                                <div key={id} className="flex justify-between items-start text-sm border-b border-zinc-100 pb-2">
                                                    <div>
                                                        <p className="font-medium">{item?.voucher_product?.name}</p>
                                                        <p className="text-xs text-muted-foreground">{qty} x Rp {itemPrice.toLocaleString('id-ID')}</p>
                                                    </div>
                                                    <p className="font-semibold">
                                                        Rp {(itemPrice * qty).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex justify-between items-center text-lg font-bold mb-4">
                                            <span>Total</span>
                                            <span className="text-indigo-600">Rp {totalCartPrice.toLocaleString('id-ID')}</span>
                                        </div>
                                        <Button
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                            size="lg"
                                            onClick={handleProcessSale}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Memproses...
                                                </>
                                            ) : (
                                                "Selesaikan Pembayaran"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <div className="bg-zinc-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <ShoppingCart className="h-6 w-6 text-zinc-400 font-bold" />
                                    </div>
                                    Keranjang masih kosong
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent History Mini Table */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <History className="h-4 w-4 mt-0.5" />
                                Transaksi Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="space-y-0.5">
                                {isSalesLoading ? (
                                    <div className="px-6 py-4 flex justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : sales.slice(0, 5).map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="px-6 py-3 hover:bg-zinc-50 transition-colors flex justify-between items-center group cursor-pointer"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-zinc-900 leading-none">
                                                ID: {sale.public_id.slice(0, 8)}...
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                {format(new Date(sale.sold_at), "HH:mm • dd MMM", { locale: idLocale })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-indigo-600">
                                                Rp {Number(sale.total_amount).toLocaleString('id-ID')}
                                            </p>
                                            <Badge variant="outline" className="text-[9px] h-4 font-normal px-1">
                                                Cash
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {!isSalesLoading && sales.length === 0 && (
                                    <div className="px-6 py-4 text-xs text-muted-foreground text-center italic">
                                        Belum ada data transaksi
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-indigo-600 rounded-none border-t mt-2 h-10">
                                Lihat Semua Transaksi
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

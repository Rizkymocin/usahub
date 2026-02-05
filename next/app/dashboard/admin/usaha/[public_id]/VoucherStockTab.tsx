'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useVoucherStockStore, IspVoucherStock } from '@/stores/voucher-stock.store';
import { useVoucherStore } from '@/stores/voucher.store';
import { Loader2, Plus, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function VoucherStockTab() {
    const { public_id } = useParams();
    const businessId = Array.isArray(public_id) ? public_id[0] : public_id || '';

    const {
        stocks,
        summary,
        isLoading,
        fetchStocks,
        fetchSummary,
        updatePrice,
        deleteStock,
        addStock
    } = useVoucherStockStore();

    const { vouchers, fetchVouchers } = useVoucherStore();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingStock, setEditingStock] = useState<IspVoucherStock | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Stock Form State
    const [formData, setFormData] = useState({
        voucher_product_id: '',
        quantity: '',
        purchase_price: '',
        default_selling_price: '',
        notes: ''
    });

    useEffect(() => {
        if (businessId) {
            fetchStocks(businessId);
            fetchSummary(businessId);
        }
    }, [businessId, fetchStocks, fetchSummary]);

    // Reset form when dialog opens
    useEffect(() => {
        if (isAddDialogOpen && businessId) {
            fetchVouchers(businessId);
            setFormData({
                voucher_product_id: '',
                quantity: '',
                purchase_price: '',
                default_selling_price: '',
                notes: ''
            });
        }
    }, [isAddDialogOpen, businessId, fetchVouchers]);

    // Update selling price when product is selected
    useEffect(() => {
        if (formData.voucher_product_id) {
            const product = vouchers.find(v => v.id?.toString() === formData.voucher_product_id);
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    default_selling_price: product.selling_price.toString()
                }));
            }
        }
    }, [formData.voucher_product_id, vouchers]);

    const handleAddStockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.voucher_product_id || !formData.quantity || !formData.default_selling_price) {
            toast.error('Mohon lengkapi data yang wajib diisi');
            return;
        }

        setIsSubmitting(true);
        try {
            await addStock(businessId, {
                voucher_product_id: parseInt(formData.voucher_product_id),
                quantity: parseInt(formData.quantity),
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
                default_selling_price: parseFloat(formData.default_selling_price),
                notes: formData.notes
            });
            toast.success('Stok berhasil ditambahkan');
            setIsAddDialogOpen(false);
        } catch (err: any) {
            toast.error(err.message || 'Gagal menambahkan stok');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePrice = async (stockId: number) => {
        if (!editPrice || parseFloat(editPrice) < 0) {
            toast.error('Harga tidak valid');
            return;
        }

        try {
            await updatePrice(businessId, stockId, parseFloat(editPrice));
            toast.success('Harga berhasil diupdate');
            setEditingStock(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal update harga');
        }
    };

    const handleDelete = async (stockId: number) => {
        if (!confirm('Apakah anda yakin ingin menghapus stok ini?')) return;

        try {
            await deleteStock(businessId, stockId);
            toast.success('Stok berhasil dihapus');
        } catch (error: any) {
            toast.error(error.message || 'Gagal hapus stok');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Manajemen Stok Voucher (Own Stock)</h2>
                    <p className="text-sm text-muted-foreground">
                        Kelola stok voucher milik bisnis sendiri.
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Stok
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Stok Voucher</DialogTitle>
                            <DialogDescription>
                                Masukkan detail stok voucher baru yang ingin ditambahkan.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddStockSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="voucher_product">Produk Voucher <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.voucher_product_id}
                                    onValueChange={(value) => setFormData({ ...formData, voucher_product_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Voucher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vouchers.filter(v => v.id).map((voucher) => (
                                            <SelectItem key={voucher.public_id} value={voucher.id!.toString()}>
                                                {voucher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Jumlah Stok <span className="text-red-500">*</span></Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="Contoh: 100"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase_price">Harga Beli</Label>
                                    <Input
                                        id="purchase_price"
                                        type="number"
                                        min="0"
                                        value={formData.purchase_price}
                                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="selling_price">Harga Jual <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="selling_price"
                                        type="number"
                                        min="0"
                                        value={formData.default_selling_price}
                                        onChange={(e) => setFormData({ ...formData, default_selling_price: e.target.value })}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Catatan tambahan (opsional)"
                                    className="resize-none"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : 'Simpan Stok'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summary.map((item) => (
                    <Card key={item.voucher_product_id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {item.voucher_product ? item.voucher_product.name : `Product #${item.voucher_product_id}`}
                            </CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.total_quantity}</div>
                            <p className="text-xs text-muted-foreground">
                                Total Nilai: {formatCurrency(item.total_value)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Stock List */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Produk Voucher</th>
                            <th className="px-6 py-3">Stok Tersedia</th>
                            <th className="px-6 py-3">Harga Beli</th>
                            <th className="px-6 py-3">Harga Jual</th>
                            <th className="px-6 py-3">Dibuat Oleh</th>
                            <th className="px-6 py-3">Tanggal Dibuat</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && stocks.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Memuat data stok...
                                </td>
                            </tr>
                        ) : stocks.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    Belum ada stok voucher. Klik tombol "Tambah Stok" untuk menambahkan.
                                </td>
                            </tr>
                        ) : (
                            stocks.map((stock) => (
                                <tr key={stock.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {stock.voucher_product?.name || '-'}
                                        {stock.notes && (
                                            <div className="text-xs text-gray-500 mt-1">{stock.notes}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {stock.quantity}
                                    </td>
                                    <td className="px-6 py-4">
                                        {stock.purchase_price ? formatCurrency(stock.purchase_price) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingStock?.id === stock.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={editPrice}
                                                    onChange={(e) => setEditPrice(e.target.value)}
                                                    className="w-24 px-2 py-1 text-sm border rounded"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleUpdatePrice(stock.id)}
                                                    className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-50 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingStock(null)}
                                                    className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 bg-gray-50 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="font-semibold text-green-700">
                                                {formatCurrency(stock.default_selling_price)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {stock.created_by?.name || 'System'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(stock.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingStock(stock);
                                                    setEditPrice(stock.default_selling_price.toString());
                                                }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit Harga"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(stock.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Hapus Stok"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

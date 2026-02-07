'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useVoucherStockStore, IspVoucherStock } from '@/stores/voucher-stock.store';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import AddStockDialog from '@/app/components/voucher/AddStockDialog';
import DamageReportDialog from '@/app/components/voucher/DamageReportDialog';
import { toast } from 'sonner';

export default function VoucherStocksPage() {
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
        reportDamage
    } = useVoucherStockStore();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingStock, setEditingStock] = useState<IspVoucherStock | null>(null);
    const [editPrice, setEditPrice] = useState('');

    // Damage Report State
    const [damageDialogOpen, setDamageDialogOpen] = useState(false);
    const [selectedStockForDamage, setSelectedStockForDamage] = useState<IspVoucherStock | null>(null);

    const handleReportDamage = async (quantity: number, reason: string, notes: string, files: File[]) => {
        if (!selectedStockForDamage) return;

        await reportDamage(businessId, selectedStockForDamage.id, quantity, reason, notes, files);
    };

    useEffect(() => {
        if (businessId) {
            fetchStocks(businessId);
            fetchSummary(businessId);
        }
    }, [businessId, fetchStocks, fetchSummary]);

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
                    <h2 className="text-2xl font-bold tracking-tight">Manajemen Stok Voucher (Own Stock)</h2>
                    <p className="text-muted-foreground">
                        Kelola stok voucher milik bisnis sendiri (bukan alokasi dari Finance).
                    </p>
                </div>
                <button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Stok Manual
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summary.map((item) => (
                    <div key={item.voucher_product_id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">
                                {item.voucher_product ? item.voucher_product.name : `Product #${item.voucher_product_id}`}
                            </h3>
                        </div>
                        <div className="text-2xl font-bold">{item.total_quantity}</div>
                        <p className="text-xs text-muted-foreground">
                            Total Nilai: {formatCurrency(item.total_value)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Stock List */}
            <div className="rounded-md border bg-white shadow-sm">
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Memuat data stok...
                                </td>
                            </tr>
                        ) : stocks.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    Belum ada stok voucher. Klik tombol "Tambah Stok Manual" untuk menambahkan.
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
                                                onClick={() => {
                                                    setSelectedStockForDamage(stock);
                                                    setDamageDialogOpen(true);
                                                }}
                                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                                title="Lapor Kerusakan/Hilang"
                                            >
                                                <span className="text-xs font-bold">Lapor</span>
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

            <AddStockDialog
                businessId={businessId}
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
            />

            <DamageReportDialog
                isOpen={damageDialogOpen}
                onClose={() => setDamageDialogOpen(false)}
                onSubmit={handleReportDamage}
                stockName={selectedStockForDamage?.voucher_product?.name}
                maxQuantity={selectedStockForDamage?.quantity}
            />
        </div>
    );
}

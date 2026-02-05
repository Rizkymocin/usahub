'use client';
import { useState, useEffect } from 'react';
import { useVoucherStore, VoucherProduct } from '@/stores/voucher.store';
import { useVoucherStockStore } from '@/stores/voucher-stock.store';

interface AddStockDialogProps {
    businessId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddStockDialog({ businessId, isOpen, onClose }: AddStockDialogProps) {
    const { vouchers, fetchVouchers } = useVoucherStore();
    const { addStock, isLoading } = useVoucherStockStore();

    const [formData, setFormData] = useState({
        voucher_product_id: '',
        quantity: '',
        purchase_price: '',
        default_selling_price: '',
        notes: ''
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchVouchers(businessId);
            setFormData({
                voucher_product_id: '',
                quantity: '',
                purchase_price: '',
                default_selling_price: '',
                notes: ''
            });
            setError(null);
        }
    }, [isOpen, businessId, fetchVouchers]);

    // Update selling price when product is selected
    useEffect(() => {
        if (formData.voucher_product_id) {
            const product = vouchers.find(v => v.id === parseInt(formData.voucher_product_id));
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    default_selling_price: product.selling_price.toString()
                }));
            }
        }
    }, [formData.voucher_product_id, vouchers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.voucher_product_id || !formData.quantity || !formData.default_selling_price) {
            setError('Mohon lengkapi data yang wajib diisi');
            return;
        }

        try {
            await addStock(businessId, {
                voucher_product_id: parseInt(formData.voucher_product_id),
                quantity: parseInt(formData.quantity),
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
                default_selling_price: parseFloat(formData.default_selling_price),
                notes: formData.notes
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menambahkan stok');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Tambah Stok Voucher</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Produk Voucher <span className="text-red-500">*</span></label>
                        <select
                            value={formData.voucher_product_id}
                            onChange={(e) => setFormData({ ...formData, voucher_product_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Pilih Voucher</option>
                            {vouchers.map((voucher) => (
                                <option key={voucher.public_id} value={voucher.id}>
                                    {voucher.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Jumlah Stok <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: 100"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Harga Beli (Opsional)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.purchase_price}
                                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Harga Jual <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min="0"
                                value={formData.default_selling_price}
                                onChange={(e) => setFormData({ ...formData, default_selling_price: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Catatan</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Catatan tambahan (opsional)"
                        />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            disabled={isLoading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Stok'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

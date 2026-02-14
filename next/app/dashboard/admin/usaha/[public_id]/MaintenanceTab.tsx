'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMaintenanceStore, type IspMaintenanceIssue } from '@/stores/maintenance.store';
import { useResellerStore } from '@/stores/reseller.store';
import { Loader2, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";

export default function MaintenanceTab() {
    const { public_id } = useParams();
    const businessId = Array.isArray(public_id) ? public_id[0] : public_id || '';

    const { issues, items, isLoading, fetchIssues, createIssue, fetchItems, createItem } = useMaintenanceStore();
    const { resellers, fetchResellers } = useResellerStore();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Detail Dialog State
    const [selectedIssue, setSelectedIssue] = useState<IspMaintenanceIssue | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const handleViewDetail = (issue: IspMaintenanceIssue) => {
        setSelectedIssue(issue);
        setIsDetailDialogOpen(true);
    };

    // Item Form State
    const [itemForm, setItemForm] = useState({
        name: '',
        unit: 'pcs',
        stock: '0',
        price: '0'
    });

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        reseller_id: '',
        priority: 'medium',
        description: ''
    });

    useEffect(() => {
        if (businessId) {
            fetchIssues(businessId);
            fetchItems(businessId);
        }
    }, [businessId, fetchIssues, fetchItems]);

    // Load resellers when dialog opens
    useEffect(() => {
        if (isAddDialogOpen && businessId) {
            fetchResellers(businessId);
            setFormData(prev => ({ ...prev, reseller_id: '' })); // Reset reseller selection
        }
    }, [isAddDialogOpen, businessId, fetchResellers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.reseller_id) {
            toast.error('Mohon lengkapi judul dan pilih reseller');
            return;
        }

        setIsSubmitting(true);
        try {
            await createIssue(businessId, {
                title: formData.title,
                reseller_id: parseInt(formData.reseller_id),
                priority: formData.priority,
                description: formData.description
            });
            toast.success('Laporan gangguan berhasil dibuat');
            setIsAddDialogOpen(false);
            // Reset form
            setFormData({
                title: '',
                reseller_id: '',
                priority: 'medium',
                description: ''
            });
        } catch (err: any) {
            toast.error(err.message || 'Gagal membuat laporan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemForm.name) return;

        setIsSubmitting(true);
        try {
            await createItem(businessId, {
                ...itemForm,
                stock: parseInt(itemForm.stock),
                price: parseFloat(itemForm.price)
            });
            toast.success('Alat & Bahan berhasil ditambahkan');
            setIsAddItemDialogOpen(false);
            setItemForm({ name: '', unit: 'pcs', stock: '0', price: '0' });
        } catch (err: any) {
            toast.error(err.message || 'Gagal menyimpan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
            case 'assigned': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>;
            case 'in_progress': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Progress</Badge>;
            case 'resolved': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
            case 'closed': return <Badge variant="outline" className="bg-gray-100 text-gray-700">Closed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical': return <span className="text-red-600 font-bold text-xs uppercase">Critical</span>;
            case 'high': return <span className="text-orange-600 font-bold text-xs uppercase">High</span>;
            case 'medium': return <span className="text-blue-600 font-medium text-xs uppercase">Medium</span>;
            case 'low': return <span className="text-gray-500 font-medium text-xs uppercase">Low</span>;
            default: return <span className="text-gray-500 text-xs">{priority}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Laporan Gangguan</h2>
                    <p className="text-sm text-muted-foreground">
                        Daftar laporan gangguan dari Reseller.
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Lapor Gangguan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Buat Laporan Gangguan</DialogTitle>
                            <DialogDescription>
                                Masukkan detail gangguan yang dilaporkan.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Gangguan <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Internet Mati Total"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reseller">Reseller Pelapor <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.reseller_id}
                                    onValueChange={(value) => setFormData({ ...formData, reseller_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Reseller" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {resellers.map((reseller) => (
                                            <SelectItem key={reseller.id} value={reseller.id?.toString() || ''}>
                                                {reseller.name} ({reseller.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Prioritas</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Prioritas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi / Detail</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Jelaskan detail masalahnya..."
                                    className="resize-none min-h-[100px]"
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
                                    ) : 'Kirim Laporan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Issues List */}
            <Tabs defaultValue="issues" className="w-full">
                <TabsList>
                    <TabsTrigger value="issues">Daftar Gangguan</TabsTrigger>
                    <TabsTrigger value="inventory">Alat & Bahan</TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="mt-4">
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Keluhan / Reseller</th>
                                    <th className="px-6 py-3">Prioritas</th>
                                    <th className="px-6 py-3">Dilaporkan</th>
                                    <th className="px-6 py-3">Teknisi</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && issues.filter(i => i.type !== 'installation').length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Memuat data gangguan...
                                        </td>
                                    </tr>
                                ) : issues.filter(i => i.type !== 'installation').length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada laporan gangguan.
                                        </td>
                                    </tr>
                                ) : (
                                    issues.filter(i => i.type !== 'installation').map((issue) => (
                                        <tr key={issue.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                {getStatusBadge(issue.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{issue.title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {issue.reseller?.name} ({issue.reseller?.address})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getPriorityBadge(issue.priority)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(issue.reported_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {issue.assigned_technician ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold">
                                                            {issue.assigned_technician.name.charAt(0)}
                                                        </div>
                                                        <span className="text-xs">{issue.assigned_technician.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs italic text-gray-400">Belum ada</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={() => handleViewDetail(issue)}
                                                >
                                                    Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="mt-4">
                    <div className="flex justify-end mb-4">
                        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Alat / Bahan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Tambah Alat & Bahan</DialogTitle>
                                    <DialogDescription>
                                        Tambahkan stok alat kerja atau material.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleItemSubmit} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Nama Barang</Label>
                                        <Input
                                            value={itemForm.name}
                                            onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                            placeholder="Contoh: Modem ZTE F609"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Stok Awal</Label>
                                            <Input
                                                type="number"
                                                value={itemForm.stock}
                                                onChange={e => setItemForm({ ...itemForm, stock: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Satuan</Label>
                                            <Input
                                                value={itemForm.unit}
                                                onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                                                placeholder="pcs, meter, unit"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Harga Satuan (Opsional)</Label>
                                        <Input
                                            type="number"
                                            value={itemForm.price}
                                            onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Nama Barang</th>
                                    <th className="px-6 py-3">Stok Saat Ini</th>
                                    <th className="px-6 py-3">Satuan</th>
                                    <th className="px-6 py-3">Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items && items.length > 0 ? items.map((item: any) => (
                                    <tr key={item.id} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${item.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada data alat & bahan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <DialogTitle>{selectedIssue?.title}</DialogTitle>
                            {selectedIssue && getStatusBadge(selectedIssue.status)}
                        </div>
                        <DialogDescription>
                            Detail laporan gangguan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedIssue && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Reseller</Label>
                                    <div className="font-medium">{selectedIssue.reseller?.name}</div>
                                    <div className="text-sm text-muted-foreground">{selectedIssue.reseller?.address}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Prioritas</Label>
                                    <div className="mt-1">{getPriorityBadge(selectedIssue.priority)}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground text-xs">Deskripsi</Label>
                                <div className="p-3 bg-slate-50 rounded-lg text-sm mt-1 min-h-[80px] whitespace-pre-wrap">
                                    {selectedIssue.description || '-'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Dilaporkan Oleh</Label>
                                    <div className="text-sm font-medium">{selectedIssue.reporter?.name || '-'}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {new Date(selectedIssue.reported_at).toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Teknisi</Label>
                                    <div className="text-sm font-medium">{selectedIssue.assigned_technician?.name || 'Belum ditugaskan'}</div>
                                </div>
                            </div>

                            {/* Logs Section */}
                            {selectedIssue.logs && selectedIssue.logs.length > 0 && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold text-sm">Riwayat Pengerjaan</h3>
                                    <div className="space-y-4">
                                        {selectedIssue.logs.map((log) => (
                                            <div key={log.id} className="bg-slate-50 rounded-lg p-3 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-sm">{log.technician.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className={
                                                        log.result === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            log.result === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                                                    }>
                                                        {log.result === 'success' ? 'Selesai' : log.result === 'pending' ? 'Pending' : 'Gagal'}
                                                    </Badge>
                                                </div>

                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Tindakan</Label>
                                                    <p className="text-sm mt-1">{log.action_taken}</p>
                                                </div>

                                                {log.items && log.items.length > 0 && (
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Material Digunakan</Label>
                                                        <ul className="mt-1 space-y-1">
                                                            {log.items.map((item) => (
                                                                <li key={item.id} className="text-sm flex justify-between items-center bg-white border px-2 py-1 rounded">
                                                                    <span>{item.name}</span>
                                                                    <span className="font-mono text-xs font-bold">{item.pivot.quantity} {item.unit}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {log.photos && log.photos.length > 0 && (
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-1 block">Dokumentasi</Label>
                                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                                            {log.photos.map((photo, idx) => (
                                                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border">
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${photo}`}
                                                                        alt="Dokumentasi"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsDetailDialogOpen(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProspectStore, type Prospect } from '@/stores/prospect.store';
import { Loader2, CheckCircle, XCircle, Clock, RotateCcw, UserPlus, MapPin, Phone, Users, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResellerStore } from "@/stores/reseller.store";

export default function CalonPasangBaru() {
    const { public_id } = useParams();
    const businessId = Array.isArray(public_id) ? public_id[0] : public_id || '';

    const { prospects, isLoading, fetchProspects, approveProspect, rejectProspect, reApproveProspect, activateProspect, assignTechnician } = useProspectStore();
    const { activeResellers, fetchActiveResellers } = useResellerStore();

    const [activeTab, setActiveTab] = useState('waiting');
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'reapprove' | 'activate'>('approve');
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
    const [actionNote, setActionNote] = useState('');
    const [commissionAmount, setCommissionAmount] = useState<number>(0);
    const [selectedUplinkId, setSelectedUplinkId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Assign technician dialog
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [assignProspect, setAssignProspect] = useState<Prospect | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    // Detail dialog
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailProspect, setDetailProspect] = useState<Prospect | null>(null);

    useEffect(() => {
        if (businessId) {
            fetchProspects(businessId);
            fetchActiveResellers(businessId);
        }
    }, [businessId, fetchProspects, fetchActiveResellers]);

    const filteredProspects = prospects.filter((p) => {
        switch (activeTab) {
            case 'waiting': return p.status === 'waiting';
            case 'approved': return p.status === 'approved';
            case 'installed': return p.status === 'installed';
            case 'rejected': return p.status === 'rejected' || p.status === 'installation_rejected';
            case 'activated': return p.status === 'activated';
            default: return true;
        }
    });

    const openAction = (prospect: Prospect, type: 'approve' | 'reject' | 'reapprove' | 'activate') => {
        setSelectedProspect(prospect);
        setActionType(type);
        setActionNote('');
        setCommissionAmount(0);
        setSelectedUplinkId('');
        setIsActionDialogOpen(true);
    };

    const handleAction = async () => {
        if (!selectedProspect) return;
        if (actionType === 'reject' && !actionNote.trim()) {
            toast.error('Catatan wajib diisi untuk penolakan');
            return;
        }

        setIsSubmitting(true);
        try {
            switch (actionType) {
                case 'approve':
                    await approveProspect(businessId, selectedProspect.public_id, actionNote || undefined, commissionAmount, selectedUplinkId ? parseInt(selectedUplinkId) : undefined);
                    toast.success(`${selectedProspect.name} berhasil disetujui. Tiket instalasi dibuat.`);
                    break;
                case 'reject':
                    await rejectProspect(businessId, selectedProspect.public_id, actionNote);
                    toast.success(`${selectedProspect.name} ditolak.`);
                    break;
                case 'reapprove':
                    await reApproveProspect(businessId, selectedProspect.public_id, actionNote || undefined);
                    toast.success(`${selectedProspect.name} disetujui ulang. Tiket instalasi baru dibuat.`);
                    break;
                case 'activate':
                    await activateProspect(businessId, selectedProspect.public_id);
                    toast.success(`${selectedProspect.name} berhasil diaktifkan sebagai reseller!`);
                    break;
            }
            setIsActionDialogOpen(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignTechnician = async (technicianUserId: number) => {
        if (!assignProspect) return;
        setIsAssigning(true);
        try {
            await assignTechnician(businessId, assignProspect.public_id, technicianUserId);
            toast.success(`Teknisi berhasil ditugaskan untuk ${assignProspect.name}`);
            setIsAssignDialogOpen(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Gagal menugaskan teknisi');
        } finally {
            setIsAssigning(false);
        }
    };

    const openAssignDialog = (prospect: Prospect) => {
        setAssignProspect(prospect);
        setIsAssignDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'waiting': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu</Badge>;
            case 'approved': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Disetujui</Badge>;
            case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>;
            case 'installed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terpasang</Badge>;
            case 'installation_rejected': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Instalasi Ditolak</Badge>;
            case 'activated': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getActionTitle = () => {
        switch (actionType) {
            case 'approve': return 'Setujui Pendaftaran';
            case 'reject': return 'Tolak Pendaftaran';
            case 'reapprove': return 'Setujui Ulang (Kirim Ulang ke Teknisi)';
            case 'activate': return 'Aktifkan sebagai Reseller';
        }
    };

    const counts = {
        waiting: prospects.filter(p => p.status === 'waiting').length,
        approved: prospects.filter(p => p.status === 'approved').length,
        installed: prospects.filter(p => p.status === 'installed').length,
        rejected: prospects.filter(p => p.status === 'rejected' || p.status === 'installation_rejected').length,
        activated: prospects.filter(p => p.status === 'activated').length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Calon Pasang Baru</h2>
                <p className="text-sm text-muted-foreground">
                    Kelola pendaftaran pelanggan baru dari sales. Setujui, tolak, atau aktifkan setelah instalasi selesai.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{counts.waiting}</div>
                    <div className="text-xs text-yellow-600">Menunggu</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{counts.approved}</div>
                    <div className="text-xs text-blue-600">Disetujui</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{counts.installed}</div>
                    <div className="text-xs text-green-600">Terpasang</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-700">{counts.rejected}</div>
                    <div className="text-xs text-red-600">Ditolak</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-700">{counts.activated}</div>
                    <div className="text-xs text-emerald-600">Aktif</div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="waiting">Menunggu ({counts.waiting})</TabsTrigger>
                    <TabsTrigger value="approved">Disetujui ({counts.approved})</TabsTrigger>
                    <TabsTrigger value="installed">Terpasang ({counts.installed})</TabsTrigger>
                    <TabsTrigger value="rejected">Ditolak ({counts.rejected})</TabsTrigger>
                    <TabsTrigger value="activated">Aktif ({counts.activated})</TabsTrigger>
                </TabsList>

                {/* All tab contents share same table structure */}
                {['waiting', 'approved', 'installed', 'rejected', 'activated'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-4">
                        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Pelanggan</th>
                                        <th className="px-6 py-3">Sales</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Catatan</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && filteredProspects.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                Memuat data...
                                            </td>
                                        </tr>
                                    ) : filteredProspects.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Tidak ada data.
                                            </td>
                                        </tr>
                                    ) : filteredProspects.map((prospect) => (
                                        <tr key={prospect.public_id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{getStatusBadge(prospect.status)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{prospect.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3" /> {prospect.phone}
                                                </div>
                                                {prospect.address && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3" /> {prospect.address}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="text-sm">{prospect.sales?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(prospect.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate">
                                                {prospect.admin_note || prospect.technician_note || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-1">
                                                <Button variant="ghost" size="sm" className="h-8 text-xs"
                                                    onClick={() => { setDetailProspect(prospect); setIsDetailOpen(true); }}>
                                                    Detail
                                                </Button>
                                                {prospect.status === 'waiting' && (
                                                    <>
                                                        <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                                            onClick={() => openAction(prospect, 'approve')}>
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Setujui
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="h-8 text-xs"
                                                            onClick={() => openAction(prospect, 'reject')}>
                                                            <XCircle className="w-3 h-3 mr-1" /> Tolak
                                                        </Button>
                                                    </>
                                                )}
                                                {prospect.status === 'installation_rejected' && (
                                                    <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                                                        onClick={() => openAction(prospect, 'reapprove')}>
                                                        <RotateCcw className="w-3 h-3 mr-1" /> Setujui Ulang
                                                    </Button>
                                                )}
                                                {prospect.status === 'approved' && (
                                                    <>
                                                        {(prospect.readiness_confirmations?.length || 0) > 0 ? (
                                                            <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                                                                onClick={(e) => { e.stopPropagation(); openAssignDialog(prospect); }}>
                                                                <Users className="w-3 h-3 mr-1" /> Pilih Teknisi ({prospect.readiness_confirmations?.length})
                                                            </Button>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]">
                                                                Belum ada teknisi siap
                                                            </Badge>
                                                        )}
                                                        {prospect.assigned_technician && (
                                                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                                                                <Wrench className="w-3 h-3 mr-1" /> {prospect.assigned_technician.name}
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}
                                                {prospect.status === 'installed' && (
                                                    <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={() => openAction(prospect, 'activate')}>
                                                        <UserPlus className="w-3 h-3 mr-1" /> Aktifkan
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Action Dialog */}
            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{getActionTitle()}</DialogTitle>
                        <DialogDescription>
                            {selectedProspect && `Pelanggan: ${selectedProspect.name} (${selectedProspect.phone})`}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType !== 'activate' && (
                        <div className="space-y-4 py-2">
                            {/* Commission (Optional) - Only for approve */}
                            {actionType === 'approve' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Uplink Reseller (Opsional)</Label>
                                        <Select
                                            value={selectedUplinkId}
                                            onValueChange={setSelectedUplinkId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Uplink Reseller" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeResellers.map((reseller) => (
                                                    <SelectItem key={reseller.id} value={String(reseller.id)}>
                                                        {reseller.name} ({reseller.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Reseller sumber internet untuk instalasi ini.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Komisi Sales (Opsional)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">Rp</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={commissionAmount}
                                                onChange={(e) => setCommissionAmount(Number(e.target.value))}
                                                className="pl-9"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Masukkan nilai komisi jika ada. Jurnal akan dibuat otomatis.
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Note Field - Visible for everyone except activate */}
                            <div className="space-y-2">
                                <Label>Catatan {actionType === 'reject' && <span className="text-red-500">*</span>}</Label>
                                <Textarea
                                    value={actionNote}
                                    onChange={(e) => setActionNote(e.target.value)}
                                    placeholder={actionType === 'reject' ? 'Jelaskan alasan penolakan...' : 'Catatan opsional...'}
                                    className="resize-none min-h-[80px]"
                                />
                            </div>
                        </div>
                    )}

                    {actionType === 'activate' && (
                        <div className="py-4 text-sm text-muted-foreground">
                            <p>Anda akan mengaktifkan <strong>{selectedProspect?.name}</strong> sebagai reseller baru.</p>
                            <p className="mt-2">Data akan dipindahkan ke tabel reseller aktif dan pelanggan akan bisa bertransaksi.</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
                        <Button
                            onClick={handleAction}
                            disabled={isSubmitting}
                            className={actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : actionType === 'activate' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        >
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : getActionTitle()}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <DialogTitle>{detailProspect?.name}</DialogTitle>
                            {detailProspect && getStatusBadge(detailProspect.status)}
                        </div>
                        <DialogDescription>Detail calon pelanggan baru</DialogDescription>
                    </DialogHeader>

                    {detailProspect && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Telepon</Label>
                                    <div className="font-medium">{detailProspect.phone}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Sales</Label>
                                    <div className="font-medium">{detailProspect.sales?.name || '-'}</div>
                                </div>
                            </div>

                            {detailProspect.address && (
                                <div>
                                    <Label className="text-muted-foreground text-xs">Alamat</Label>
                                    <div className="text-sm mt-1">{detailProspect.address}</div>
                                </div>
                            )}

                            {detailProspect.latitude && detailProspect.longitude && (
                                <div>
                                    <Label className="text-muted-foreground text-xs">Lokasi</Label>
                                    <div className="text-sm mt-1">
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${detailProspect.latitude},${detailProspect.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" /> Buka di Google Maps
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Didaftarkan</Label>
                                    <div className="text-sm">{new Date(detailProspect.created_at).toLocaleString('id-ID')}</div>
                                </div>
                                {detailProspect.approved_at && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Disetujui</Label>
                                        <div className="text-sm">{new Date(detailProspect.approved_at).toLocaleString('id-ID')}</div>
                                        <div className="text-xs text-muted-foreground">oleh {detailProspect.approved_by_user?.name || '-'}</div>
                                    </div>
                                )}
                                {detailProspect.installed_at && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Terpasang</Label>
                                        <div className="text-sm">{new Date(detailProspect.installed_at).toLocaleString('id-ID')}</div>
                                    </div>
                                )}
                                {detailProspect.activated_at && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Diaktifkan</Label>
                                        <div className="text-sm">{new Date(detailProspect.activated_at).toLocaleString('id-ID')}</div>
                                    </div>
                                )}
                            </div>

                            {detailProspect.admin_note && (
                                <div>
                                    <Label className="text-muted-foreground text-xs">Catatan Admin</Label>
                                    <div className="p-3 bg-slate-50 rounded-lg text-sm mt-1 whitespace-pre-wrap">{detailProspect.admin_note}</div>
                                </div>
                            )}

                            {detailProspect.technician_note && (
                                <div>
                                    <Label className="text-muted-foreground text-xs">Catatan Teknisi</Label>
                                    <div className="p-3 bg-orange-50 rounded-lg text-sm mt-1 whitespace-pre-wrap">{detailProspect.technician_note}</div>
                                </div>
                            )}

                            {detailProspect.outlet && (
                                <div>
                                    <Label className="text-muted-foreground text-xs">Outlet</Label>
                                    <div className="text-sm font-medium">{detailProspect.outlet.name}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Technician Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Pilih Teknisi</DialogTitle>
                        <DialogDescription>
                            {assignProspect && `Pilih teknisi untuk instalasi: ${assignProspect.name}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        {assignProspect?.readiness_confirmations && assignProspect.readiness_confirmations.length > 0 ? (
                            assignProspect.readiness_confirmations.map((conf) => (
                                <div key={conf.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="font-medium text-sm">{conf.user?.name || `User #${conf.user_id}`}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Konfirmasi: {new Date(conf.confirmed_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                                        disabled={isAssigning}
                                        onClick={() => handleAssignTechnician(conf.user_id)}
                                    >
                                        {isAssigning ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Tugaskan'}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                                Belum ada teknisi yang mengkonfirmasi kesiapan.
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

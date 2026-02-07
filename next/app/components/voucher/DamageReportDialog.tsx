'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DamageReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (quantity: number, reason: string, notes: string, files: File[]) => Promise<void>;
    stockName?: string;
    maxQuantity?: number;
}

export default function DamageReportDialog({
    isOpen,
    onClose,
    onSubmit,
    stockName,
    maxQuantity
}: DamageReportDialogProps) {
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('damage');
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!quantity || parseInt(quantity) <= 0) {
            toast.error('Jumlah tidak valid');
            return;
        }

        if (maxQuantity && parseInt(quantity) > maxQuantity) {
            toast.error(`Jumlah melebihi stok yang tersedia (${maxQuantity})`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(parseInt(quantity), reason, notes, files);
            toast.success('Laporan kerusakan berhasil dikirim');
            onClose();
            // Reset form
            setQuantity('');
            setReason('damage');
            setNotes('');
            setFiles([]);
        } catch (error: any) {
            console.error(error);
            // Error handling usually done in parent catch, but toast here just in case matches parent behavior
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Lapor Kerusakan / Kehilangan</DialogTitle>
                    <DialogDescription>
                        Laporkan voucher yang rusak atau hilang untuk disesuaikan stoknya.
                        {stockName && <div className="font-semibold mt-1">Produk: {stockName}</div>}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="adjustment_quantity">Jumlah <span className="text-red-500">*</span></Label>
                        <Input
                            id="adjustment_quantity"
                            type="number"
                            min="1"
                            max={maxQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Contoh: 5"
                            required
                        />
                        {maxQuantity !== undefined && (
                            <p className="text-xs text-muted-foreground">Stok tersedia: {maxQuantity}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Alasan <span className="text-red-500">*</span></Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Alasan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="damage">Rusak</SelectItem>
                                <SelectItem value="loss">Hilang</SelectItem>
                                <SelectItem value="expired">Kadaluarsa</SelectItem>
                                <SelectItem value="other">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adjustment_notes">Catatan / Keterangan</Label>
                        <Textarea
                            id="adjustment_notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Jelaskan detail kerusakan atau kehilangan..."
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="evidence">Bukti Foto (Opsional)</Label>
                        <Input
                            id="evidence"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button type="submit" variant="destructive" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : 'Laporkan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

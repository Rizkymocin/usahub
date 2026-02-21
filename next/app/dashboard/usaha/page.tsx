"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { useAuthUser } from "@/stores/auth.selectors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Building2, MapPin, Pencil } from "lucide-react"

interface Business {
    id: number
    public_id: string
    name: string
    category: string
    address?: string
    is_active: boolean
    created_at: string
    accounts_count: number
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Link from "next/link"

// Helper function to map category codes to labels
const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
        'isp': 'Internet Service Provider',
        'atk': 'Alat Tulis Kantor',
        'cafe': 'Cafe & Coffee Shop',
        'food': 'Restaurant & Food',
    }
    return labels[category] || category
}

export default function UsahaPage() {
    const user = useAuthUser()
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [planLimits, setPlanLimits] = useState({ current_count: 0, max_business: 1 })

    // Form State
    const [newName, setNewName] = useState("")
    const [newCategory, setNewCategory] = useState("isp")
    const [newAddress, setNewAddress] = useState("")

    // Edit State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
    const [editName, setEditName] = useState("")
    const [editCategory, setEditCategory] = useState("isp")
    const [editAddress, setEditAddress] = useState("")

    useEffect(() => {
        fetchBusinesses()
    }, [])

    const fetchBusinesses = async () => {
        try {
            const { data } = await axios.get('businesses')
            if (data.success) {
                setBusinesses(data.data)
                if (data.meta) {
                    setPlanLimits(data.meta)
                }
            }
        } catch (error) {
            console.error("Failed to fetch businesses", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddBusiness = async () => {
        if (!newName) {
            toast.error("Nama usaha harus diisi")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                name: newName,
                category: newCategory,
                address: newAddress,
                is_active: true
            }
            const { data } = await axios.post('businesses', payload)

            if (data.success) {
                toast.success("Usaha berhasil ditambahkan")
                setIsAddDialogOpen(false)
                setNewName("")
                setNewAddress("")
                setNewCategory("isp")
                fetchBusinesses()
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal menambahkan usaha"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditClick = (business: Business) => {
        setEditingBusiness(business)
        setEditName(business.name)
        setEditCategory(business.category)
        setEditAddress(business.address || "")
        setIsEditDialogOpen(true)
    }

    const handleUpdateBusiness = async () => {
        if (!editingBusiness || !editName) {
            toast.error("Nama usaha harus diisi")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                name: editName,
                category: editCategory,
                address: editAddress,
                is_active: editingBusiness.is_active
            }
            const { data } = await axios.put(`businesses/${editingBusiness.public_id}`, payload)

            if (data.success) {
                toast.success("Usaha berhasil diperbarui")
                setIsEditDialogOpen(false)
                setEditingBusiness(null)
                fetchBusinesses()
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal memperbarui usaha"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper to check if user has owner role
    const isOwner = user?.roles?.some((r: any) => (typeof r === 'string' ? r : r.name) === 'owner') || user?.role === 'owner';

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Daftar Usaha</h1>
                    <p className="text-muted-foreground mt-1">Kelola data usaha anda disini</p>
                </div>

                {isOwner && (
                    <div className="flex flex-col items-end">
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                    disabled={businesses.length >= planLimits.max_business}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Usaha
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Usaha Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan detail usaha baru anda. Pastikan paket berlangganan anda mencukupi.
                                        Limit Paket saat ini: {planLimits.max_business} usaha.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Usaha</Label>
                                        <Input
                                            id="name"
                                            placeholder="Contoh: Cafe Kenangan"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategori</Label>
                                        <Select value={newCategory} onValueChange={setNewCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="isp">Internet Service Provider</SelectItem>
                                                <SelectItem value="atk">Alat Tulis Kantor</SelectItem>
                                                <SelectItem value="cafe">Cafe & Coffee Shop</SelectItem>
                                                <SelectItem value="food">Restaurant & Food</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat (Opsional)</Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Alamat lengkap usaha..."
                                            value={newAddress}
                                            onChange={(e) => setNewAddress(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                                    <Button onClick={handleAddBusiness} disabled={isSubmitting}>
                                        {isSubmitting ? "Menyimpan..." : "Simpan"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        {businesses.length >= planLimits.max_business && (
                            <p className="text-xs text-amber-600 mt-2">
                                Limit paket berlangganan Anda ({planLimits.max_business} usaha) telah tercapai.
                            </p>
                        )}
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Usaha</DialogTitle>
                            <DialogDescription>
                                Perbarui detail usaha anda.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nama Usaha</Label>
                                <Input
                                    id="edit-name"
                                    placeholder="Contoh: Cafe Kenangan"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-category">Kategori</Label>
                                <Select
                                    value={editCategory}
                                    onValueChange={setEditCategory}
                                    disabled={editingBusiness ? editingBusiness.accounts_count > 5 : false}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="isp">Internet Service Provider</SelectItem>
                                        <SelectItem value="atk">Alat Tulis Kantor</SelectItem>
                                        <SelectItem value="cafe">Cafe & Coffee Shop</SelectItem>
                                        <SelectItem value="food">Restaurant & Food</SelectItem>
                                    </SelectContent>
                                </Select>
                                {editingBusiness && editingBusiness.accounts_count > 5 && (
                                    <p className="text-xs text-amber-600">
                                        Kategori terkunci karena akun tambahan telah dibuat (Total: {editingBusiness.accounts_count}).
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-address">Alamat (Opsional)</Label>
                                <Textarea
                                    id="edit-address"
                                    placeholder="Alamat lengkap usaha..."
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleUpdateBusiness} disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>List Usaha</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Nama Usaha</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Kategori</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Alamat</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {businesses.length === 0 ? (
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td colSpan={5} className="p-4 align-middle text-center py-8 text-muted-foreground">
                                                Belum ada data usaha
                                            </td>
                                        </tr>
                                    ) : (
                                        businesses.map((business) => (
                                            <tr key={business.public_id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle font-medium">
                                                    <div className="flex items-center gap-2 hover:text-primary">
                                                        <Building2 className="h-4 w-4 text-gray-500" />
                                                        <Link href={`/dashboard/usaha/${business.public_id}`}>{business.name}</Link>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant="outline" className="capitalize">
                                                        {getCategoryLabel(business.category)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[200px]">
                                                            {business.address || "-"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge className={business.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                                                        {business.is_active ? "Aktif" : "Non-Aktif"}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(business)}>
                                                        <Pencil className="h-4 w-4 mr-1" /> Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
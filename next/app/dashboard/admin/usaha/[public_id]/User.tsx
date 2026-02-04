"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBusiness } from "@/stores/business.selectors"
import { useBusinessUsers, useIsBusinessUserLoading, useBusinessUserActions } from "@/stores/business-user.selectors"
import { Badge } from "@/components/ui/badge"

// Helper to format role text
const formatRole = (role: string | undefined | any) => {
    if (!role) return "Tidak Ada Peran";
    if (typeof role !== 'string') return JSON.stringify(role); // Debugging fallback or safe return

    switch (role) {
        case 'business_admin': return 'Admin Usaha';
        case 'kasir': return 'Kasir';
        case 'isp_teknisi': return 'Teknisi'; // Legacy
        case 'isp_outlet': return 'Outlet'; // Legacy
        case 'finance': return 'Finance';
        case 'teknisi_maintenance': return 'Teknisi Maintenance';
        case 'teknisi_pasang_baru': return 'Teknisi Pasang Baru';
        case 'sales': return 'Sales';
        case 'owner': return 'Pemilik';
        case 'manager': return 'Manajer';
        case 'staff': return 'Staf';
        default: return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

// User interface is now imported from store or inferred
import { User } from "@/stores/business-user.store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserPage() {
    const { public_id } = useParams()

    // Store Hooks
    const users = useBusinessUsers()
    const isLoading = useIsBusinessUserLoading()
    const { fetchUsers, addUser } = useBusinessUserActions()

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newRoles, setNewRoles] = useState<string[]>([])

    const business = useBusiness()

    // Define roles based on business category
    const availableRoles = useMemo(() => {
        const baseRoles = [
            { value: 'business_admin', label: 'Business Admin' },
            { value: 'kasir', label: 'Kasir' },
        ]

        if (business?.category === 'isp') {
            return [
                { value: 'business_admin', label: 'Business Admin' },
                { value: 'finance', label: 'Finance' },
                { value: 'teknisi_maintenance', label: 'Teknisi Maintenance' },
                { value: 'teknisi_pasang_baru', label: 'Teknisi Pasang Baru' },
                { value: 'sales', label: 'Sales' },
            ]
        }

        return baseRoles
    }, [business?.category])


    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchUsers(id)
        }
    }, [public_id])

    const handleAddUser = async () => {
        if (!newName || !newEmail || newRoles.length === 0) {
            toast.error("Semua field harus diisi dan minimal 1 peran dipilih")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                name: newName,
                email: newEmail,
                role: newRoles // Send array
            }
            const { data } = await axios.post(`businesses/${public_id}/users`, payload)

            if (data.success) {
                toast.success("Pengguna berhasil ditambahkan")
                // Update store
                addUser(data.data)

                setIsAddDialogOpen(false)
                setNewName("")
                setNewEmail("")
                setNewRoles([])
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal menambahkan pengguna"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Daftar Pengguna</h2>
                        <p className="text-sm text-muted-foreground">
                            Kelola pengguna yang terdaftar pada usaha anda.
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                                <DialogDescription>
                                    Tambahkan pengguna baru pada usaha anda.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Pengguna</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: John Doe"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="Contoh: john@example.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Peran</Label>
                                    <div className="grid grid-cols-1 gap-2 border rounded-md p-3">
                                        {availableRoles.map((role) => (
                                            <div key={role.value} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`role-${role.value}`}
                                                    checked={newRoles.includes(role.value)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewRoles([...newRoles, role.value])
                                                        } else {
                                                            setNewRoles(newRoles.filter(r => r !== role.value))
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor={`role-${role.value}`} className="cursor-pointer font-normal">
                                                    {role.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {newRoles.length > 0 && (
                                        <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded border border-border">
                                            Role Password Defaults:
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                                {newRoles.map(role => {
                                                    const password = role === 'kasir' ? 'kasir123' :
                                                        role === 'business_admin' ? 'admin123' :
                                                            role === 'isp_outlet' ? 'outlet123' :
                                                                (role === 'isp_teknisi' || role.startsWith('teknisi_')) ? 'teknisi123' :
                                                                    role === 'finance' ? 'finance123' :
                                                                        role === 'sales' ? 'sales123' :
                                                                            'password123';
                                                    return (
                                                        <li key={role}>
                                                            <span className="font-medium">{availableRoles.find(r => r.value === role)?.label}:</span> {password}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                *User akan dibuat menggunakan password dari role prioritas utama (urutan sistem).
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                                <Button onClick={handleAddUser} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Peran</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Belum ada pengguna.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.email}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.role_names && user.role_names.length > 0 ? (
                                                    user.role_names.map((role: string) => (
                                                        <Badge key={role} variant="secondary" className="font-normal">
                                                            {formatRole(role)}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <Badge variant="secondary" className="font-normal">
                                                        {formatRole(user.role)}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </CardContent>


        </Card>
    )
}
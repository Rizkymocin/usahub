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
const formatRole = (role: string | undefined) => {
    if (!role) return "Tidak Ada Peran";

    switch (role) {
        case 'business_admin': return 'Admin Usaha';
        case 'kasir': return 'Kasir';
        case 'isp_teknisi': return 'Teknisi';
        case 'isp_outlet': return 'Outlet';
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
    const [newRole, setNewRole] = useState("")

    const business = useBusiness()

    // Define roles based on business category
    const availableRoles = useMemo(() => {
        const baseRoles = [
            { value: 'business_admin', label: 'Business Admin' },
            { value: 'kasir', label: 'Kasir' },
        ]

        if (business?.category === 'isp') {
            return [
                ...baseRoles,
                { value: 'isp_teknisi', label: 'ISP Teknisi' },
                { value: 'isp_outlet', label: 'ISP Outlet' },
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
        if (!newName || !newEmail || !newRole) {
            toast.error("Semua field harus diisi")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                name: newName,
                email: newEmail,
                role: newRole
            }
            const { data } = await axios.post(`businesses/${public_id}/users`, payload)

            if (data.success) {
                toast.success("Pengguna berhasil ditambahkan")
                // Update store
                addUser(data.data)

                setIsAddDialogOpen(false)
                setNewName("")
                setNewEmail("")
                setNewRole("")
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
                                    <Label htmlFor="role">Peran</Label>
                                    <Select value={newRole} onValueChange={setNewRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Peran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {newRole && (
                                        <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded border border-border">
                                            Password default untuk role ini adalah <strong>
                                                {newRole === 'kasir' ? 'kasir123' :
                                                    newRole === 'business_admin' ? 'admin123' :
                                                        newRole === 'isp_outlet' ? 'outlet123' :
                                                            newRole === 'isp_teknisi' ? 'teknisi123' :
                                                                'password123'}
                                            </strong>
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
                                            <Badge variant="secondary" className="font-normal">
                                                {formatRole(user.role)}
                                            </Badge>
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
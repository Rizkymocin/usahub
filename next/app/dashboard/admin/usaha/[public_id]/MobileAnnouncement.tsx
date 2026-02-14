"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAnnouncementStore, Announcement } from "@/stores/announcement.store"

export default function MobileAnnouncement() {
    const params = useParams()
    const {
        announcements,
        isLoading,
        fetchAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement
    } = useAnnouncementStore()

    // Search State
    const [searchQuery, setSearchQuery] = useState("")

    // Dialog & Form States
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "info" as "info" | "penting",
        status: "active" as "active" | "inactive"
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Delete Alert State
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)

    useEffect(() => {
        if (params.public_id) {
            fetchAnnouncements(params.public_id as string)
        }
    }, [params.public_id, fetchAnnouncements])

    const handleOpenCreate = () => {
        setIsEditing(false)
        setFormData({
            title: "",
            content: "",
            type: "info",
            status: "active"
        })
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (announcement: Announcement) => {
        setIsEditing(true)
        setCurrentId(announcement.id)
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            status: announcement.status
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (isEditing && currentId) {
                await updateAnnouncement(params.public_id as string, currentId, formData)
                toast.success("Announcement updated successfully")
            } else {
                await addAnnouncement(params.public_id as string, formData)
                toast.success("Announcement created successfully")
            }
            setIsDialogOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to save announcement")
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = (id: number) => {
        setItemToDelete(id)
        setIsDeleteAlertOpen(true)
    }

    const handleDelete = async () => {
        if (!itemToDelete) return

        try {
            await deleteAnnouncement(params.public_id as string, itemToDelete)
            toast.success("Announcement deleted successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete announcement")
        } finally {
            setIsDeleteAlertOpen(false)
            setItemToDelete(null)
        }
    }

    const filteredAnnouncements = announcements.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Pengumuman Mobile</CardTitle>
                    <CardDescription>Kelola pengumuman yang akan tampil di aplikasi mobile pelanggan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari pengumuman..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Pengumuman
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Konten</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAnnouncements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Tidak ada pengumuman ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAnnouncements.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell className="max-w-xs truncate">{item.content}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.type === 'penting' ? 'destructive' : 'secondary'}>
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'active' ? 'default' : 'outline'}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Pengumuman" : "Tambah Pengumuman"}</DialogTitle>
                        <DialogDescription>
                            Isi detail pengumuman di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="content">Konten</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Tipe</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value as "info" | "penting" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">Info</SelectItem>
                                            <SelectItem value="penting">Penting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pengumuman ini akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function Outlets() {
    const { public_id } = useParams()
    const [outlets, setOutlets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")

    useEffect(() => {
        if (public_id) fetchOutlets()
    }, [public_id])

    const fetchOutlets = async () => {
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            const res = await axios.get(`/api/businesses/${id}/outlets`)
            setOutlets(res.data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            await axios.post(`/api/businesses/${id}/outlets`, {
                name, phone, address
            })
            toast.success("Outlet berhasil ditambahkan")
            setIsDialogOpen(false)
            fetchOutlets()
            setName("")
            setPhone("")
            setAddress("")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menambahkan outlet")
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daftar Outlet</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Outlet
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Outlet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nama Outlet</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Telepon</Label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Alamat</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSubmit}>Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3">Nama</th>
                                    <th className="p-3">Telepon</th>
                                    <th className="p-3">Alamat</th>
                                    <th className="p-3">Saldo</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outlets.map((item: any) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3">{item.phone}</td>
                                        <td className="p-3">{item.address}</td>
                                        <td className="p-3">Rp {item.current_balance?.toLocaleString()}</td>
                                        <td className="p-3">{item.status ? 'Aktif' : 'Nonaktif'}</td>
                                    </tr>
                                ))}
                                {outlets.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            Belum ada data outlet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

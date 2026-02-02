"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function Resellers() {
    const { public_id } = useParams()
    const [resellers, setResellers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // TODO: Add Dialog for creating reseller

    useEffect(() => {
        if (public_id) fetchResellers()
    }, [public_id])

    const fetchResellers = async () => {
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            const res = await axios.get(`/api/businesses/${id}/resellers`)
            setResellers(res.data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daftar Reseller</CardTitle>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Reseller
                </Button>
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
                                    <th className="p-3">Kode</th>
                                    <th className="p-3">Telepon</th>
                                    <th className="p-3">Outlet</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resellers.map((item: any) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3">{item.code}</td>
                                        <td className="p-3">{item.phone}</td>
                                        <td className="p-3">{item.outlet?.name}</td>
                                        <td className="p-3">{item.is_active ? 'Aktif' : 'Nonaktif'}</td>
                                    </tr>
                                ))}
                                {resellers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            Belum ada data reseller
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

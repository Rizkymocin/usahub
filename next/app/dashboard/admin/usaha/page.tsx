"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Eye } from "lucide-react"
import Link from "next/link"
import { Business } from "@/types/business"

export default function AdminUsahaPage() {
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchBusinesses()
    }, [])

    const fetchBusinesses = async () => {
        try {
            const response = await axios.get('business-by-admin')
            if (response.data.success) {
                setBusinesses(response.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch businesses", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Daftar Usaha</h1>
                    <p className="text-muted-foreground mt-1">
                        Daftar usaha yang anda kelola
                    </p>
                </div>
            </div>

            <Card>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="p-4 font-medium">Nama Usaha</th>
                                        <th className="p-4 font-medium">Kategori</th>
                                        <th className="p-4 font-medium">Alamat</th>
                                        <th className="p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {businesses.map((business) => (
                                        <tr key={business.public_id} className="hover:bg-muted/50">
                                            <td className="p-4 font-medium">
                                                <div className="flex items-center gap-2 hover:text-primary">
                                                    <Building2 className="h-4 w-4 text-gray-500" />
                                                    <Link href={`/dashboard/admin/usaha/${business.public_id}`} className="hover:underline text-primary">
                                                        {business.name}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className="uppercase">
                                                    {business.category}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-muted-foreground max-w-xs truncate">
                                                {business.address || "-"}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={business.is_active ? "default" : "destructive"}>
                                                    {business.is_active ? "Aktif" : "Nonaktif"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {businesses.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                Belum ada usaha yang ditugaskan kepada anda.
                                            </td>
                                        </tr>
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

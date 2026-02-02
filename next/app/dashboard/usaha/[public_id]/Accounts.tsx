"use client"

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
import { toast } from "sonner"
import { ArrowLeft, Plus, FolderTree, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBusinessName, useBusinessActions } from "@/stores/business.selectors"
import axios from "@/lib/axios"

interface Account {
    id: number
    public_id: string
    name: string
    code: string
    type: string
    parent_id: number | null
}

interface TreeNode extends Account {
    children: TreeNode[]
}

const buildTree = (accounts: Account[]): TreeNode[] => {
    const map = new Map<number, TreeNode>()
    const roots: TreeNode[] = []

    // 1. Initialize map
    accounts.forEach(acc => {
        map.set(acc.id, { ...acc, children: [] })
    })

    // 2. Build relationships
    accounts.forEach(acc => {
        const node = map.get(acc.id)!
        if (acc.parent_id === null) {
            roots.push(node)
        } else {
            const parent = map.get(acc.parent_id)
            if (parent) {
                parent.children.push(node)
            } else {
                // If parent likely missing or not loaded, treat as root for safety
                roots.push(node)
            }
        }
    })

    return roots
}

const AccountItem = ({ node, level = 0, onDelete }: { node: TreeNode; level?: number; onDelete: (id: number) => void }) => {
    return (
        <div className="space-y-1">
            <div
                className={`p-3 rounded-md flex items-center justify-between border ${level === 0 ? 'bg-muted/50 font-medium' : 'bg-background hover:bg-muted/20'}`}
                style={{ marginLeft: `${level * 1.5}rem` }}
            >
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm px-2 py-1 rounded text-primary ${level === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                        {node.code}
                    </span>
                    <span>{node.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground capitalize">{node.type}</span>
                    {node.parent_id !== null && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                            onClick={() => onDelete(node.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            {node.children.length > 0 && (
                <div className="border-l-2 border-muted border-dashed ml-3 pl-1">
                    {node.children.map(child => (
                        <AccountItem key={child.id} node={child} level={level + 1} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function Accounts() {
    const { public_id } = useParams()
    const router = useRouter()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [accountTree, setAccountTree] = useState<TreeNode[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [newName, setNewName] = useState("")
    const [newCode, setNewCode] = useState("")
    const [parentId, setParentId] = useState<string>("")

    const businessName = useBusinessName()
    const { fetchBusiness } = useBusinessActions()

    useEffect(() => {
        if (public_id) {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            fetchAccounts()
            fetchBusiness(id)
        }
    }, [public_id])

    const fetchAccounts = async () => {
        try {
            const { data } = await axios.get(`businesses/${public_id}/accounts`)
            if (data.success) {
                setAccounts(data.data)
                setAccountTree(buildTree(data.data))
            }
        } catch (error) {
            console.error("Failed to fetch accounts", error)
            toast.error("Gagal memuat data akun")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddAccount = async () => {
        if (!newName || !newCode || !parentId) {
            toast.error("Semua field harus diisi")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                name: newName,
                code: newCode,
                parent_id: parseInt(parentId)
            }
            const { data } = await axios.post(`businesses/${public_id}/accounts`, payload)

            if (data.success) {
                toast.success("Akun berhasil ditambahkan")
                setIsAddDialogOpen(false)
                setNewName("")
                setNewCode("")
                setParentId("")
                fetchAccounts()
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal menambahkan akun"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAccount = async (id: number) => {
        if (!confirm("Apakah anda yakin ingin menghapus akun ini?")) return;

        try {
            const { data } = await axios.delete(`businesses/${public_id}/accounts/${id}`)
            if (data.success) {
                toast.success("Akun berhasil dihapus")
                fetchAccounts()
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal menghapus akun"
            toast.error(msg)
        }
    }
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Daftar Akun</h2>
                    <p className="text-sm text-muted-foreground">
                        Kelola struktur akun keuangan usaha anda (Chart of Accounts).
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Sub-Akun
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Sub-Akun Baru</DialogTitle>
                            <DialogDescription>
                                Tambahkan akun baru di bawah akun induk yang sudah ada.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="parent">Akun Induk</Label>
                                <Select value={parentId} onValueChange={setParentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Akun Induk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.code} - {acc.name} ({acc.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Akun</Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Bank BCA"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Akun</Label>
                                <Input
                                    id="code"
                                    placeholder="Contoh: 1001"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleAddAccount} disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderTree className="h-5 w-5" /> Struktur Akun
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Loading accounts...</div>
                    ) : accounts.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">Belum ada akun.</div>
                    ) : (
                        <div className="space-y-1">
                            <div className="space-y-4">
                                {accountTree.map((node) => (
                                    <AccountItem key={node.id} node={node} onDelete={handleDeleteAccount} />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
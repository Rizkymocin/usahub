"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, EyeOff } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type RegisterFormProps = {
    onSubmit: (data: any) => void,
    isLoading?: boolean,
} & Omit<React.ComponentProps<"div">, "onSubmit">

export function RegisterForm({
    className,
    onSubmit,
    isLoading = false,
    ...props
}: RegisterFormProps) {
    const searchParams = useSearchParams()
    const [plan, setPlan] = useState("free")
    const [category, setCategory] = useState("isp")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        const planParam = searchParams.get("plan")
        if (planParam && ["free", "starter", "growth"].includes(planParam)) {
            setPlan(planParam)
        }
    }, [searchParams])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        // Map plan names to plan IDs (assuming: free=1, starter=2, growth=3)
        const planIdMap: Record<string, number> = {
            free: 1,
            starter: 2,
            growth: 3
        }

        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            password_confirmation: formData.get("password_confirmation") as string,
            business_name: formData.get("business_name") as string,
            category: category,
            plan_id: planIdMap[plan]
        }
        onSubmit(data)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Daftar Akun</h1>
                                <p className="text-muted-foreground text-balance">
                                    Mulai kelola bisnismu sekarang
                                </p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                                <Input
                                    className="h-10 px-4"
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    className="h-10 px-4"
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="business_name">Nama Bisnis</FieldLabel>
                                <Input
                                    className="h-10 px-4"
                                    id="business_name"
                                    name="business_name"
                                    type="text"
                                    placeholder="Nama Bisnis Anda"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="category">Kategori Bisnis</FieldLabel>
                                <Select value={category} onValueChange={setCategory} name="category">
                                    <SelectTrigger id="category" className="h-10">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="isp">Internet Service Provider (ISP)</SelectItem>
                                        <SelectItem value="atk" disabled>Toko ATK (Coming Soon)</SelectItem>
                                        <SelectItem value="cafe" disabled>Cafe & Resto (Coming Soon)</SelectItem>
                                        <SelectItem value="toko" disabled>Toko Retail (Coming Soon)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        className="py-4 pr-10"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password_confirmation">Konfirmasi Password</FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        className="py-4 pr-10"
                                        name="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-sm text-red-500 mt-1">Password tidak sama!</p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel className="mb-3 block">Pilih Paket</FieldLabel>
                                <RadioGroup value={plan} onValueChange={setPlan} className="grid grid-cols-3 gap-4">
                                    <div>
                                        <RadioGroupItem value="free" id="free" className="peer sr-only" />
                                        <Label
                                            htmlFor="free"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer"
                                        >
                                            <span className="text-sm font-semibold">Free</span>
                                            <span className="text-xs text-muted-foreground">Rp 0</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="starter" id="starter" className="peer sr-only" />
                                        <Label
                                            htmlFor="starter"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer"
                                        >
                                            <span className="text-sm font-semibold">Starter</span>
                                            <span className="text-xs text-muted-foreground">99k</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="growth" id="growth" className="peer sr-only" />
                                        <Label
                                            htmlFor="growth"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer"
                                        >
                                            <span className="text-sm font-semibold">Growth</span>
                                            <span className="text-xs text-muted-foreground">249k</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </Field>

                            <Field>
                                <Button className="py-4" type="submit" disabled={isLoading || (confirmPassword !== "" && password !== confirmPassword)}>
                                    {isLoading ? "Loading..." : "Daftar Sekarang"}
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                Sudah punya akun? <Link href="/auth/login" className="underline font-medium hover:text-blue-600">Login disini</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="https://images.unsplash.com/photo-1673287579248-1a785be29719?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Office workspace"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

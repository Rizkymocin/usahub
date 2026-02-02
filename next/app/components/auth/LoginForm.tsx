"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

type LoginFormProps = {
    onSubmit: (data: { user: string, password: string }) => void,
    isLoading?: boolean,
} & Omit<React.ComponentProps<"div">, "onSubmit">

export function LoginForm({
    className,
    onSubmit,
    isLoading = false,
    ...props
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const data = {
            user: formData.get("user") as string,
            password: formData.get("password") as string,

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
                                <h1 className="text-2xl font-bold">Selamat Datang</h1>
                                <p className="text-muted-foreground text-balance">
                                    Silakan Masuk dengan email dan password
                                </p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="user">Email / Username</FieldLabel>
                                <Input
                                    className="h-12 text-lg px-4"
                                    id="user"
                                    name="user"
                                    type="text"
                                    placeholder="m@example.com or Username"
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        Lupa password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        className="py-6 pr-10"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
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
                                <Button className="py-6" type="submit" disabled={isLoading}>
                                    {isLoading ? "Loading..." : "Login"}
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                Belum punya akun? <br />Silakan melakukan <Link href="/auth/register" className="underline font-medium hover:text-blue-600">Registrasi</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="https://plus.unsplash.com/premium_photo-1661740422528-611c1ae26094?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                <strong>UsaHub</strong> adalah platform digitalisasi UMKM untuk kemajuan ekonomi digital Indonesia
            </FieldDescription>
        </div>
    )
}

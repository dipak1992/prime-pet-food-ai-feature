'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a symbol'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

type PageState = 'checking' | 'ready' | 'success' | 'expired'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('checking')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // Verify the user arrived via a valid recovery session
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        setPageState('expired')
      } else {
        setPageState('ready')
      }
    })
  }, [])

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setServerError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: values.password })

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    setPageState('success')
    toast.success('Password updated successfully!')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  // Checking session
  if (pageState === 'checking') {
    return (
      <div className="glass-card rounded-2xl border border-border/60 p-8 shadow-xl flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Recovery link expired / invalid
  if (pageState === 'expired') {
    return (
      <div className="glass-card rounded-2xl border border-border/60 p-8 shadow-xl text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Link expired or invalid</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This password reset link has expired or has already been used. Please request a new one.
        </p>
        <Button className="w-full" onClick={() => router.push('/forgot-password')}>
          Request new reset link
        </Button>
      </div>
    )
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="glass-card rounded-2xl border border-border/60 p-8 shadow-xl text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Password updated!</h1>
        <p className="text-sm text-muted-foreground">
          Taking you to your dashboard…
        </p>
      </div>
    )
  }

  // Main form
  return (
    <div className="glass-card rounded-2xl border border-border/60 p-8 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a strong password for your MealEase account.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="12+ characters, mixed case, number, symbol"
            autoComplete="new-password"
            autoFocus
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating password…</>
          ) : (
            'Update password'
          )}
        </Button>
      </form>
    </div>
  )
}

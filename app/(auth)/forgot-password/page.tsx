'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { Turnstile } from '@/components/auth/Turnstile'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setServerError(null)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email, captchaToken }),
    })

    if (!res.ok && res.status === 429) {
      setServerError('Too many reset attempts. Please wait and try again.')
      setLoading(false)
      return
    }

    setSentTo(values.email)
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="glass-card rounded-2xl border border-border/60 p-8 shadow-xl text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Check your email</h1>
        <p className="text-sm text-muted-foreground mb-1">
          We sent a password reset link to
        </p>
        <p className="text-sm font-medium mb-6 break-all">{sentTo}</p>
        <p className="text-xs text-muted-foreground mb-6">
          The link expires in 30 minutes. If you don&apos;t see it, check your spam folder.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Link>
        </Button>
        <button
          onClick={() => setSent(false)}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 w-full"
        >
          Didn&apos;t receive it? Try again
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl border border-border/60 p-8 shadow-xl">
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <Turnstile onToken={setCaptchaToken} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending link…</>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>
    </div>
  )
}

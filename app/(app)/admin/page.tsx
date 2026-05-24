import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { Badge } from '@/components/ui/badge'
import { Users, Crown, Mail, AlertTriangle } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard')
  }

  const [{ data: profile }, { data: assurance }] = await Promise.all([
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ])

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  if (assurance?.currentLevel !== 'aal2') {
    redirect('/settings?mfa=required')
  }

  const serviceClient = createSupabaseServiceClient()
  const weekAgoDate = new Date()
  weekAgoDate.setDate(weekAgoDate.getDate() - 7)
  const weekAgo = weekAgoDate.toISOString()

  const [totalResult, proResult, usersResult, emailSentResult, emailFailedResult] = await Promise.all([
    serviceClient.from('profiles').select('id', { count: 'exact', head: true }),
    serviceClient.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_tier', 'pro'),
    serviceClient.auth.admin.listUsers({ perPage: 20, page: 1 }),
    serviceClient.from('email_logs').select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('created_at', weekAgo),
    serviceClient.from('email_logs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', weekAgo),
  ])

  const totalUsers = totalResult.count ?? 0
  const proUsers = proResult.count ?? 0
  const freeUsers = totalUsers - proUsers
  const emailsSentThisWeek = emailSentResult.count ?? 0
  const emailsFailedThisWeek = emailFailedResult.count ?? 0
  const recentUsers = (usersResult.data?.users ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Platform metrics and recent sign-ups</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="glass-card rounded-xl border border-border/60 p-5 text-center">
          <p className="text-3xl font-bold">{totalUsers}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Users</p>
        </div>
        <div className="glass-card rounded-xl border border-border/60 p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">{proUsers}</p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Crown className="h-3.5 w-3.5" /> Plus Users
          </p>
        </div>
        <div className="glass-card rounded-xl border border-border/60 p-5 text-center">
          <p className="text-3xl font-bold">{freeUsers}</p>
          <p className="text-sm text-muted-foreground mt-1">Free Users</p>
        </div>
      </div>

      {/* Email Stats (7-day) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-xl border border-border/60 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{emailsSentThisWeek}</p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Emails Sent (7d)
          </p>
        </div>
        <div className="glass-card rounded-xl border border-border/60 p-5 text-center">
          <p className={`text-3xl font-bold ${emailsFailedThisWeek > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {emailsFailedThisWeek}
          </p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Failed (7d)
          </p>
        </div>
      </div>

      {/* Recent sign-ups table */}
      <div className="glass-card rounded-xl border border-border/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <h2 className="font-semibold">Recent Sign-ups (last {recentUsers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Joined</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Last Sign-in</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Provider</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-3 font-medium">{u.email ?? '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {u.app_metadata?.provider ?? 'email'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

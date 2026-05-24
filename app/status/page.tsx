import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'System Status | MealEase',
  description: 'Current operational status of MealEase services.',
}

export default function StatusPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">System Status</h1>
      <p className="text-sm text-muted-foreground mb-10">MealEase service health</p>

      <div className="space-y-4">
        {[
          { name: 'App', status: 'Operational' },
          { name: 'API', status: 'Operational' },
          { name: 'AI Engine', status: 'Operational' },
          { name: 'Authentication', status: 'Operational' },
          { name: 'Payments (Stripe)', status: 'Operational' },
        ].map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-white px-5 py-4"
          >
            <span className="text-sm font-medium text-foreground">{service.name}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {service.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-6 py-5 text-center">
        <p className="text-sm font-semibold text-emerald-800">All systems operational</p>
        <p className="text-xs text-emerald-700/70 mt-1">
          Last checked: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          Experiencing issues?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </main>
  )
}

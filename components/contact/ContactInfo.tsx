import Link from 'next/link'
import { Mail, MessageCircle, Clock, Shield } from 'lucide-react'

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-[#FDF6F1] to-white dark:from-neutral-900 dark:to-neutral-950 ring-1 ring-[#D97757]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#D97757]/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-[#D97757]" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">Prefer email?</p>
            <a
              href="mailto:hello@mealeaseai.com"
              className="text-[#D97757] hover:text-[#C86646] font-medium"
            >
              hello@mealeaseai.com
            </a>
            <p className="mt-1 text-sm text-neutral-500">
              The founders read every message. Really.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <InfoRow
          icon={<Clock className="w-4 h-4 text-[#D97757]" />}
          label="Response time"
          value="Within 24 hours, usually same-day"
        />
        <InfoRow
          icon={<MessageCircle className="w-4 h-4 text-[#D97757]" />}
          label="Support hours"
          value="Monday–Friday, 9 AM–6 PM ET"
        />
        <InfoRow
          icon={<Shield className="w-4 h-4 text-[#D97757]" />}
          label="Privacy"
          value="Your message stays between us. Never shared, never sold."
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
          Quick links
        </p>
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li>
            <Link href="/pricing" className="hover:text-[#D97757] transition-colors">
              Pricing &amp; plans →
            </Link>
          </li>
          <li>
            <Link href="/press" className="hover:text-[#D97757] transition-colors">
              Press kit →
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-[#D97757] transition-colors">
              About us →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{value}</p>
      </div>
    </div>
  )
}

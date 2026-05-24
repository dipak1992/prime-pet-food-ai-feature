import { AuthShell } from '@/components/auth/AuthShell'
import { AuthProviders } from '@/components/auth/AuthProviders'
import { EmailAuthForm } from '@/components/auth/EmailAuthForm'

export const metadata = {
  title: 'Sign in | MealEase',
  description: 'Sign in to your MealEase account.',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your MealEase account."
      footerText="Don't have an account?"
      footerLink={{ label: 'Sign up free', href: '/signup' }}
    >
      <div className="space-y-4">
        <AuthProviders next="/dashboard" />

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200/80 dark:border-neutral-700/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-400 dark:text-neutral-500">
              or continue with email
            </span>
          </div>
        </div>

        <EmailAuthForm mode="login" next="/dashboard" />
      </div>
    </AuthShell>
  )
}

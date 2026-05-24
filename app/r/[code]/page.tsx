import { redirect } from 'next/navigation'

export default function ReferralRedirectPage({
  params,
}: {
  params: { code: string }
}) {
  redirect(`/signup?ref=${encodeURIComponent(params.code)}`)
}

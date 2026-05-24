import { Metadata } from 'next'
import { InviteAcceptClient } from './invite-accept-client'

export const metadata: Metadata = {
  title: 'Join as Co-Chef — MealEase',
  description: 'You\'ve been invited to collaborate on meal planning. Accept the invite to start cooking together!',
}

export default function InviteAcceptPage({ params }: { params: Promise<{ code: string }> }) {
  return <InviteAcceptClient paramsPromise={params} />
}

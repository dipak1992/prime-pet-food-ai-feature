import type { Metadata } from 'next'
import { ScanDemoClient } from './scan-demo-client'

export const metadata: Metadata = {
  title: 'Try Snap & Cook — Free Demo | MealEase',
  description: 'See how MealEase turns a photo of your fridge into personalized dinner ideas. Try the Snap & Cook demo — no sign-up required.',
  openGraph: {
    title: 'Try Snap & Cook — Free Demo | MealEase',
    description: 'See how MealEase turns a photo of your fridge into personalized dinner ideas.',
  },
}

export default function ScanDemoPage() {
  return <ScanDemoClient />
}

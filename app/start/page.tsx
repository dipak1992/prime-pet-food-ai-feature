import { StartFlowClient } from './start-flow-client'
import { productStory } from '@/lib/marketing/stats'

export const metadata = {
  title: 'Plan your first dinner | MealEase',
  description: productStory,
}

export default function StartPage() {
  return <StartFlowClient />
}

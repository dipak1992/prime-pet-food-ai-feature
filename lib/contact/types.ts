export type ContactTopic =
  | 'general'
  | 'support'
  | 'billing'
  | 'partnership'
  | 'press'
  | 'feedback'

export const TOPIC_LABELS: Record<ContactTopic, string> = {
  general: 'General question',
  support: 'I need help with the app',
  billing: 'Billing or subscription',
  partnership: 'Partnership or business',
  press: 'Press or media',
  feedback: 'Feedback or feature idea',
}

export type ContactPayload = {
  name: string
  email: string
  topic: ContactTopic
  message: string
}

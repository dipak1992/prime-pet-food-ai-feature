'use client'

import { ContactForm } from '@/components/contact/ContactForm'
import { ContactInfo } from '@/components/contact/ContactInfo'

export function ContactClient() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
      <div className="lg:col-span-7">
        <ContactForm />
      </div>
      <div className="lg:col-span-5">
        <ContactInfo />
      </div>
    </div>
  )
}

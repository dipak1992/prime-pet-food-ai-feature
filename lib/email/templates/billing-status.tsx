import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

type FailedPaymentProps = {
  firstName?: string
  amount?: string
  invoiceUrl?: string
}

export function FailedPaymentEmail({ firstName, amount, invoiceUrl }: FailedPaymentProps) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>We could not process your MealEase Plus payment.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Your MealEase Plus payment needs attention</Heading>
            <Text style={styles.p}>Hi {name},</Text>
            <Text style={styles.p}>
              We could not process your latest MealEase Plus payment{amount ? ` for ${amount}` : ''}.
              Your meal plans and saved preferences are still here.
            </Text>
            <Text style={styles.p}>
              Please update your payment method to keep Plus features active without interruption.
            </Text>
            <Link href={invoiceUrl ?? `${SITE}/settings`} style={styles.button}>
              Update billing →
            </Link>
            <Hr style={styles.divider} />
            <Text style={styles.muted}>
              MealEase subscriptions are securely billed through DDS Supply LLC via Stripe.
              Questions? Reply to this email or write to{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>hello@mealeaseai.com</Link>.
            </Text>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Billing notice</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

type CancellationProps = {
  firstName?: string
  accessEndsAt?: string
}

export function CancellationConfirmationEmail({ firstName, accessEndsAt }: CancellationProps) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>Your MealEase Plus cancellation is confirmed.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Your cancellation is confirmed</Heading>
            <Text style={styles.p}>Hi {name},</Text>
            <Text style={styles.p}>
              Your MealEase Plus subscription has been cancelled.
              {accessEndsAt ? ` You will keep Plus access until ${accessEndsAt}.` : ' Your account will remain on the free plan.'}
            </Text>
            <Text style={styles.p}>
              Your saved meals, preferences, grocery lists, and household setup remain in MealEase.
            </Text>
            <Link href={`${SITE}/dashboard`} style={styles.button}>
              Open MealEase →
            </Link>
            <Hr style={styles.divider} />
            <Text style={styles.muted}>
              MealEase is a product of DDS Supply LLC. Need help or want to share what changed?{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>Reply anytime</Link>.
            </Text>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Subscription update</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

type RefundProps = {
  firstName?: string
  amount?: string
}

export function RefundConfirmationEmail({ firstName, amount }: RefundProps) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>Your MealEase refund has been processed.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Your refund has been processed</Heading>
            <Text style={styles.p}>Hi {name},</Text>
            <Text style={styles.p}>
              We processed your MealEase refund{amount ? ` for ${amount}` : ''}. Stripe will return it to your
              original payment method according to your bank or card issuer&apos;s timing.
            </Text>
            <Hr style={styles.divider} />
            <Text style={styles.muted}>
              MealEase subscriptions are securely billed through DDS Supply LLC via Stripe.
              Questions? Reply to this email or write to{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>hello@mealeaseai.com</Link>.
            </Text>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Refund confirmation</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

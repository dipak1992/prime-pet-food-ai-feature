import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  planName?: string
}

export function ProConfirmationEmail({ firstName, planName = 'Plus' }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>You&apos;re now on MealEase Plus — welcome to the full experience.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>You&apos;re on MealEase {planName} ✨</Heading>

            <Text style={styles.p}>
              Hi {name}, your upgrade is confirmed. You now have full access to
              the connected MealEase system: full weekly planning, smart
              grocery lists, leftovers, budget context, and household memory.
            </Text>

            <Text style={styles.p}>
              We&apos;re glad you&apos;re here. Let&apos;s make dinner easier.
            </Text>

            <Link href={`${SITE}/dashboard`} style={styles.button}>
              Open MealEase →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              MealEase subscriptions are securely billed through DDS Supply LLC via Stripe.
              To manage or cancel, visit your{' '}
              <Link href={`${SITE}/settings`} style={{ color: colors.sage }}>account settings</Link>.
              Questions? Write to{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>
                hello@mealeaseai.com
              </Link>
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              MealEase · Subscription confirmation
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ProConfirmationEmail

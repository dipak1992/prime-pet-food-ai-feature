import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  /** Last active date shown to user, e.g. "June 12, 2025" */
  lastActiveDate?: string
}

export function ReactivationEmail({ firstName, lastActiveDate }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>We noticed you haven&apos;t stopped by lately — your meal plans are waiting.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Your kitchen misses you, {name}</Heading>

            <Text style={styles.p}>
              It&apos;s been a while since we last saw you{lastActiveDate ? ` — your last visit was ${lastActiveDate}` : ''}.
              Your saved meals, grocery lists, and preferences are exactly where you left them.
            </Text>

            <Text style={styles.p}>
              Jump back in whenever you&apos;re ready. Dinner can be on the table in minutes.
            </Text>

            <Link href={`${SITE}/dashboard`} style={styles.button}>
              Pick up where you left off →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              Not interested in meal planning right now?{' '}
              You can{' '}
              <Link href={`${SITE}/settings/notifications`} style={{ color: colors.sage }}>
                adjust your email preferences
              </Link>{' '}
              at any time.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              MealEase · We&apos;re here when you need us
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ReactivationEmail

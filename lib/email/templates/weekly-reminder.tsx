import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  unsubscribeUrl?: string
}

export function WeeklyReminderEmail({ firstName, unsubscribeUrl }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>Plan your week in 30 seconds — your dinner schedule is waiting.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Plan your week in 30 seconds</Heading>

            <Text style={styles.p}>
              Hi {name}, a new week is almost here. A few taps and your dinners
              are sorted — no last-minute stress, no &ldquo;I don&apos;t know&rdquo; answers.
            </Text>

            <Text style={styles.p}>
              Your weekly planner is ready. Let&apos;s fill it.
            </Text>

            <Link href={`${SITE}/planner`} style={styles.button}>
              Build this week&apos;s plan →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              You&apos;re receiving this weekly planning nudge. To turn it off, visit your{' '}
              <Link href={`${SITE}/settings`} style={{ color: colors.sage }}>notification settings</Link>.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Weekly planning reminder</Text>
            {unsubscribeUrl && (
              <Text style={styles.footerText}>
                <Link href={unsubscribeUrl} style={{ color: colors.sage, fontSize: '12px' }}>Unsubscribe</Link>
              </Text>
            )}
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default WeeklyReminderEmail

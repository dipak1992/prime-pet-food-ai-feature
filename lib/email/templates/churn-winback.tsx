import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  /** How many days since the user was last active, e.g. 30 */
  daysSince?: number
  unsubscribeUrl?: string
}

export function ChurnWinbackEmail({ firstName, daysSince = 30, unsubscribeUrl }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>It&apos;s been a while — come back and let MealEase do the hard part again.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Hey {name}, still thinking about dinner?</Heading>

            <Text style={styles.p}>
              It&apos;s been {daysSince} days since your last visit — and that&apos;s okay. Life gets busy.
              But we&apos;d love to have you back.
            </Text>

            <Text style={styles.p}>
              MealEase is still here, still learning your tastes, and still ready to plan a whole week
              of meals in under a minute. Everything you saved is exactly where you left it.
            </Text>

            <Link href={`${SITE}/dashboard`} style={styles.button}>
              Come back — it&apos;s free →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              Not feeling it?{' '}
              {unsubscribeUrl ? (
                <>
                  <Link href={unsubscribeUrl} style={{ color: colors.sage }}>
                    Unsubscribe
                  </Link>{' '}
                  and we&apos;ll stop sending these.
                </>
              ) : (
                <>
                  You can{' '}
                  <Link href={`${SITE}/settings/notifications`} style={{ color: colors.sage }}>
                    manage your email preferences
                  </Link>{' '}
                  any time.
                </>
              )}
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              MealEase · Dinner made easy
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ChurnWinbackEmail
